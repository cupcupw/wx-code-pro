import type { LoaderContext } from "webpack";
import type { CopyLoaderOptions } from "./types";

export default function loader(this: LoaderContext<CopyLoaderOptions>, content: string){
  console.log('this =>' , this );
  console.log('content =>' , content );
  return ''
}