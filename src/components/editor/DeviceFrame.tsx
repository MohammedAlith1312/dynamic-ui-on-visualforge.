import { Breakpoint } from "./ResponsiveControls";

interface DeviceFrameProps {
  breakpoint: Breakpoint;
  children: React.ReactNode;
}

export const DeviceFrame = ({ breakpoint, children }: DeviceFrameProps) => {
  if (breakpoint === "desktop") {
    return <div className="w-full h-full">{children}</div>;
  }

  const isMobile = breakpoint === "mobile";
  const width = isMobile ? 375 : 768;
  const height = isMobile ? 667 : 1024;
  
  const frameStyles = isMobile
    ? "mx-auto border-8 border-gray-800 rounded-[2.5rem] shadow-2xl relative bg-gray-800"
    : "mx-auto border-8 border-gray-700 rounded-[2rem] shadow-2xl relative bg-gray-700";

  const notchStyles = isMobile
    ? "absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gray-800 rounded-b-3xl z-10"
    : "absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-700 rounded-b-lg z-10";

  return (
    <div className="py-8 px-4">
      <div className={frameStyles} style={{ width: `${width}px` }}>
        <div className={notchStyles}>
          {isMobile && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-900 rounded-full" />
          )}
        </div>
        
        <div 
          className="bg-white rounded-[1.75rem] overflow-auto custom-scrollbar" 
          style={{
            height: `${height}px`,
            maxHeight: `${height}px`
          }}
        >
          {children}
        </div>
        
        {isMobile && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 border-2 border-gray-900 rounded-full" />
        )}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          margin: 1.75rem;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
      `}</style>
    </div>
  );
};
