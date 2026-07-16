declare module "next/image" {
  import * as React from "react";

  type StaticImageData = {
    src: string;
    height: number;
    width: number;
    blurDataURL?: string;
  };

  interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string | StaticImageData;
    alt: string;
    fill?: boolean;
    priority?: boolean;
    quality?: number;
    sizes?: string;
    placeholder?: "blur" | "empty";
    blurDataURL?: string;
    unoptimized?: boolean;
  }

  export default function Image(props: ImageProps): React.JSX.Element;
}
