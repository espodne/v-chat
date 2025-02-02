import { forwardRef } from 'react';

const VideoGrid = forwardRef<HTMLDivElement>((props, ref) => {
  return <div ref={ref} className="video-grid"></div>;
});

export default VideoGrid;