import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CardComponentEditorProps {
  content: {
    layout?: "image-top" | "image-left" | "pricing";
    title?: string;
    description?: string;
    imageUrl?: string;
    price?: string;
    features?: string;
    buttonText?: string;
    buttonLink?: string;
  };
  onUpdate: (content: any) => void;
}

export const CardComponentEditor = ({ content, onUpdate }: CardComponentEditorProps) => {
  const layout = content.layout || "image-top";
  const title = content.title || "Card Title";
  const description = content.description || "Card description goes here";
  const imageUrl = content.imageUrl || "";
  const price = content.price || "$29";
  const features = content.features || "Feature 1\nFeature 2\nFeature 3";
  const buttonText = content.buttonText || "Learn More";
  const buttonLink = content.buttonLink || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Card Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Card Layout</Label>
          <Select value={layout} onValueChange={(val) => onUpdate({ ...content, layout: val })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image-top">Image on Top</SelectItem>
              <SelectItem value="image-left">Image on Left</SelectItem>
              <SelectItem value="pricing">Pricing Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-title">Title</Label>
          <Input
            id="card-title"
            value={title}
            onChange={(e) => onUpdate({ ...content, title: e.target.value })}
            placeholder="Card title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-description">Description</Label>
          <Textarea
            id="card-description"
            value={description}
            onChange={(e) => onUpdate({ ...content, description: e.target.value })}
            placeholder="Card description"
            rows={3}
          />
        </div>

        {(layout === "image-top" || layout === "image-left") && (
          <div className="space-y-2">
            <Label htmlFor="card-image">Image URL</Label>
            <Input
              id="card-image"
              value={imageUrl}
              onChange={(e) => onUpdate({ ...content, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
        )}

        {layout === "pricing" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="card-price">Price</Label>
              <Input
                id="card-price"
                value={price}
                onChange={(e) => onUpdate({ ...content, price: e.target.value })}
                placeholder="$29/month"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-features">Features (one per line)</Label>
              <Textarea
                id="card-features"
                value={features}
                onChange={(e) => onUpdate({ ...content, features: e.target.value })}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                rows={4}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="card-button-text">Button Text</Label>
          <Input
            id="card-button-text"
            value={buttonText}
            onChange={(e) => onUpdate({ ...content, buttonText: e.target.value })}
            placeholder="Learn More"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-button-link">Button Link</Label>
          <Input
            id="card-button-link"
            value={buttonLink}
            onChange={(e) => onUpdate({ ...content, buttonLink: e.target.value })}
            placeholder="/link"
          />
        </div>
      </CardContent>
    </Card>
  );
};
