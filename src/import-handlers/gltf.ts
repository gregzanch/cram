import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


async function parse(data: ArrayBuffer | string): Promise<GLTF> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
  
    loader.parse(data, '', resolve, reject);
  });
}

export async function gltf(data: ArrayBuffer | string) {
  
  const gltf = await parse(data);

  return gltf;
  
}