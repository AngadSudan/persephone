import React from "react";
import HeroLeft from "./HeroLeft";
import HeroRight from "./HeroRight";

function Landing() {
  return (
    <div className="w-full mt-12 min-h-screen flex items-center justify-between text-4xl font-bold  overflow-hidden relative">
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-grid-subtle pointer-events-none" />

      <div className="w-1/2 px-20 flex flex-col gap-10 relative z-10">
        <HeroLeft />
      </div>

      <div className="w-1/2 relative z-10 flex items-center justify-center h-screen">
        <HeroRight />
      </div>
    </div>
  );
}

export default Landing;
