# File Storage Service Plan

## Overview

This document describes the file storage abstraction layer that supports multiple storage providers (local filesystem, AWS S3, Azure Blob Storage, Google Cloud Storage) to replace Supabase Storage.

## Architecture

### Storage Service Interface

```javascript
// src/services/storage/BaseStorageService.js
class BaseStorageService {
  async upload(file, path, options = {}) {
    throw new Error('upload() must be implemented');
  }

  async delete(path) {
    throw new Error('delete() must be implemented');
  }

  async getUrl(path, options = {}) {
    throw new Error('getUrl() must be implemented');
  }

  async exists(path) {
    throw new Error('exists() must be implemented');
  }

  async copy(sourcePath, destPath) {
    throw new Error('copy() must be implemented');
  }

  async move(sourcePath, destPath) {
    throw new Error('move() must be implemented');
  }

  async list(prefix, options = {}) {
    throw new Error('list() must be implemented');
  }
}

module.exports = BaseStorageService;
```

## Local Storage Implementation

```javascript
// src/services/storage/LocalStorageService.js
const fs = require('fs').promises;
const path = require('path');
const BaseStorageService = require('./BaseStorageService');

class LocalStorageService extends BaseStorageService {
  constructor(config) {
    super();
    this.storagePath = config.storagePath || './uploads';
    this.baseUrl = config.baseUrl || 'http://localhost:3000/files';
  }

  async upload(file, filePath, options = {}) {
    const fullPath = path.join(this.storagePath, filePath);
    const dir = path.dirname(fullPath);

    // Create directory if it doesn't exist
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, file.buffer);

    return {
      path: filePath,
      url: `${this.baseUrl}/${filePath}`,
      size: file.size
    };
  }

  async delete(filePath) {
    const fullPath = path.join(this.storagePath, filePath);
    await fs.unlink(fullPath);
    return true;
  }

  async getUrl(filePath, options = {}) {
    if (options.signed && options.expiresIn) {
      // Generate signed URL (for private files)
      const signedUrl = await this.generateSignedUrl(filePath, options.expiresIn);
      return signedUrl;
    }
    return `${this.baseUrl}/${filePath}`;
  }

  async exists(filePath) {
    const fullPath = path.join(this.storagePath, filePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async copy(sourcePath, destPath) {
    const sourceFull = path.join(this.storagePath, sourcePath);
    const destFull = path.join(this.storagePath, destPath);
    const destDir = path.dirname(destFull);
    
    await fs.mkdir(destDir, { recursive: true });
    await fs.copyFile(sourceFull, destFull);
    return destPath;
  }

  async move(sourcePath, destPath) {
    await this.copy(sourcePath, destPath);
    await this.delete(sourcePath);
    return destPath;
  }

  async list(prefix, options = {}) {
    const dirPath = path.join(this.storagePath, prefix);
    const files = await fs.readdir(dirPath, { recursive: true });
    return files.map(file => ({
      name: file,
      path: path.join(prefix, file)
    }));
  }

  async generateSignedUrl(filePath, expiresIn) {
    // Simple signed URL generation for local storage
    const crypto = require('crypto');
    const expires = Date.now() + expiresIn * 1000;
    const signature = crypto
      .createHmac('sha256', process.env.STORAGE_SECRET)
      .update(`${filePath}:${expires}`)
      .digest('hex');
    
    return `${this.baseUrl}/${filePath}?expires=${expires}&signature=${signature}`;
  }
}

module.exports = LocalStorageService;
```

## AWS S3 Implementation

```javascript
// src/services/storage/S3StorageService.js
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const BaseStorageService = require('./BaseStorageService');

class S3StorageService extends BaseStorageService {
  constructor(config) {
    super();
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
    this.bucket = config.bucket;
    this.baseUrl = config.baseUrl || `https://${config.bucket}.s3.${config.region}.amazonaws.com`;
  }

  async upload(file, filePath, options = {}) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: options.public ? 'public-read' : 'private',
      Metadata: options.metadata || {}
    });

    await this.client.send(command);

    return {
      path: filePath,
      url: options.public ? `${this.baseUrl}/${filePath}` : null,
      size: file.size
    };
  }

  async delete(filePath) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: filePath
    });

    await this.client.send(command);
    return true;
  }

  async getUrl(filePath, options = {}) {
    if (options.signed && options.expiresIn) {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: filePath
      });

      return await getSignedUrl(this.client, command, {
        expiresIn: options.expiresIn
      });
    }

    return `${this.baseUrl}/${filePath}`;
  }

  async exists(filePath) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: filePath
      });
      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  async copy(sourcePath, destPath) {
    const command = new CopyObjectCommand({
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${sourcePath}`,
      Key: destPath
    });

    await this.client.send(command);
    return destPath;
  }

  async move(sourcePath, destPath) {
    await this.copy(sourcePath, destPath);
    await this.delete(sourcePath);
    return destPath;
  }

  async list(prefix, options = {}) {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
      MaxKeys: options.limit || 1000
    });

    const response = await this.client.send(command);
    return (response.Contents || []).map(item => ({
      name: item.Key.split('/').pop(),
      path: item.Key,
      size: item.Size,
      lastModified: item.LastModified
    }));
  }
}

module.exports = S3StorageService;
```

## Storage Factory

```javascript
// src/services/storage/index.js
const LocalStorageService = require('./LocalStorageService');
const S3StorageService = require('./S3StorageService');
const AzureStorageService = require('./AzureStorageService');
const GCSStorageService = require('./GCSStorageService');
const config = require('../../config/env');

let storageService = null;

function createStorageService() {
  const provider = config.STORAGE_PROVIDER || 'local';

  switch (provider) {
    case 'local':
      return new LocalStorageService({
        storagePath: config.STORAGE_PATH || './uploads',
        baseUrl: config.STORAGE_BASE_URL || 'http://localhost:3000/files'
      });

    case 's3':
      return new S3StorageService({
        region: config.AWS_REGION,
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
        bucket: config.AWS_BUCKET_NAME,
        baseUrl: config.AWS_BASE_URL
      });

    case 'azure':
      return new AzureStorageService({
        accountName: config.AZURE_ACCOUNT_NAME,
        accountKey: config.AZURE_ACCOUNT_KEY,
        containerName: config.AZURE_CONTAINER_NAME
      });

    case 'gcs':
      return new GCSStorageService({
        projectId: config.GCS_PROJECT_ID,
        keyFilename: config.GCS_KEY_FILENAME,
        bucketName: config.GCS_BUCKET_NAME
      });

    default:
      throw new Error(`Unsupported storage provider: ${provider}`);
  }
}

function getStorageService() {
  if (!storageService) {
    storageService = createStorageService();
  }
  return storageService;
}

module.exports = { getStorageService };
```

## File Service

```javascript
// src/services/FileService.js
const { getStorageService } = require('./storage');
const File = require('../models/File');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class FileService {
  constructor() {
    this.storage = getStorageService();
  }

  async uploadFile(file, userId, folder = '') {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const extension = path.extname(file.originalname);
    const filename = `${uuidv4()}${extension}`;
    const filePath = folder ? `${folder}/${filename}` : filename;

    // Upload to storage
    const uploadResult = await this.storage.upload(file, filePath, {
      public: true,
      metadata: {
        originalName: file.originalname,
        uploadedBy: userId
      }
    });

    // Save metadata to database
    const fileRecord = await File.create({
      user_id: userId,
      filename: filename,
      original_filename: file.originalname,
      file_path: filePath,
      file_url: uploadResult.url,
      file_type: this.getFileType(file.mimetype),
      file_size: file.size,
      mime_type: file.mimetype,
      storage_provider: process.env.STORAGE_PROVIDER || 'local'
    });

    return fileRecord;
  }

  async deleteFile(fileId, userId) {
    const file = await File.findById(fileId);

    if (!file) {
      throw new Error('File not found');
    }

    if (file.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    // Delete from storage
    await this.storage.delete(file.file_path);

    // Delete from database
    await File.delete(fileId);

    return true;
  }

  async getFileUrl(fileId, options = {}) {
    const file = await File.findById(fileId);

    if (!file) {
      throw new Error('File not found');
    }

    if (options.signed) {
      return await this.storage.getUrl(file.file_path, {
        signed: true,
        expiresIn: options.expiresIn || 3600
      });
    }

    return file.file_url;
  }

  async listFiles(userId, options = {}) {
    return await File.list({
      user_id: userId,
      file_type: options.fileType,
      page: options.page || 1,
      limit: options.limit || 50
    });
  }

  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4'
    ];

    if (file.size > maxSize) {
      throw new Error('File size exceeds maximum allowed size');
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('File type not allowed');
    }
  }

  getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'document';
    return 'other';
  }
}

module.exports = FileService;
```

## File Controller

```javascript
// src/controllers/FileController.js
const FileService = require('../services/FileService');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

class FileController {
  constructor() {
    this.fileService = new FileService();
  }

  async upload(req, res, next) {
    try {
      const file = req.file;
      const folder = req.body.folder || '';
      const fileRecord = await this.fileService.uploadFile(
        file,
        req.user.id,
        folder
      );

      res.status(201).json({
        success: true,
        data: fileRecord
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await this.fileService.deleteFile(id, req.user.id);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getUrl(req, res, next) {
    try {
      const { id } = req.params;
      const { signed, expiresIn } = req.query;
      
      const url = await this.fileService.getFileUrl(id, {
        signed: signed === 'true',
        expiresIn: expiresIn ? parseInt(expiresIn) : undefined
      });

      res.json({
        success: true,
        data: { url }
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const { fileType, page, limit } = req.query;
      const files = await this.fileService.listFiles(req.user.id, {
        fileType,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50
      });

      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { FileController, upload };
```

## Routes

```javascript
// src/routes/files.js
const express = require('express');
const { FileController, upload } = require('../controllers/FileController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const controller = new FileController();

router.use(authenticate);

router.post('/upload',
  upload.single('file'),
  controller.upload.bind(controller)
);

router.get('/', controller.list.bind(controller));
router.get('/:id/url', controller.getUrl.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

module.exports = router;
```

## Image Processing

```javascript
// src/services/ImageProcessingService.js
const sharp = require('sharp');

class ImageProcessingService {
  async resize(buffer, width, height) {
    return await sharp(buffer)
      .resize(width, height, { fit: 'inside' })
      .toBuffer();
  }

  async generateThumbnail(buffer, size = 200) {
    return await sharp(buffer)
      .resize(size, size, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  async optimize(buffer, quality = 80) {
    return await sharp(buffer)
      .jpeg({ quality })
      .toBuffer();
  }
}

module.exports = new ImageProcessingService();
```

## CDN Integration

```javascript
// For CDN integration, update the base URL
const cdnUrl = process.env.CDN_URL || 'https://cdn.example.com';
const fileUrl = `${cdnUrl}/${filePath}`;
```

## Testing

```javascript
// tests/services/FileService.test.js
describe('FileService', () => {
  it('should upload a file', async () => {
    const file = {
      buffer: Buffer.from('test'),
      originalname: 'test.txt',
      mimetype: 'text/plain',
      size: 4
    };

    const result = await fileService.uploadFile(file, 'user-123');
    expect(result.filename).toBeDefined();
  });
});
```

