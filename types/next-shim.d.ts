declare module "next" {
  export interface NextConfig {}
  export type Metadata = Record<string, unknown>;
  export type ResolvingMetadata = Record<string, unknown>;
  export type ResolvingViewport = Record<string, unknown>;
}

declare module "next/link" {
  import * as React from "react";

  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string | { pathname?: string; query?: Record<string, unknown> };
    prefetch?: boolean;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    legacyBehavior?: boolean;
    children?: React.ReactNode;
  }

  export default function Link(props: LinkProps): React.JSX.Element;
}

declare module "next/image" {
  import * as React from "react";

  type StaticImageData = {
    src: string;
    height: number;
    width: number;
    blurDataURL?: string;
  };

  export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
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

declare module "next/server" {
  export class NextResponse {
    constructor(body?: BodyInit | null, init?: ResponseInit);
    static json(body: unknown, init?: ResponseInit): Response;
    static redirect(url: string | URL, init?: ResponseInit): Response;
  }

  export interface NextRequest extends Request {
    json(): Promise<unknown>;
    text(): Promise<string>;
  }
}

declare module "next/server.js" {
  export * from "next/server";
}

declare module "next/types.js" {
  export type NextConfig = Record<string, unknown>;
  export type ResolvingMetadata = Record<string, unknown>;
  export type ResolvingViewport = Record<string, unknown>;
}
