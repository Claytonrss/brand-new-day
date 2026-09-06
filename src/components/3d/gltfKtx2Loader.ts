import type { WebGLRenderer } from 'three';
import { KTX2Loader, type GLTFLoader } from 'three-stdlib';

const BASIS_PATH = '/basis/';

let ktx2Loader: KTX2Loader | null = null;
let detectedGl: WebGLRenderer | null = null;

export function configureGltfKtx2Loader(loader: GLTFLoader, gl: WebGLRenderer): void {
  if (!ktx2Loader) {
    ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath(BASIS_PATH);
  }

  if (detectedGl !== gl) {
    ktx2Loader.detectSupport(gl);
    detectedGl = gl;
  }

  loader.setKTX2Loader(ktx2Loader);
}

export function extendGltfLoaderWithKtx2(gl: WebGLRenderer) {
  return (loader: GLTFLoader) => {
    configureGltfKtx2Loader(loader, gl);
  };
}
