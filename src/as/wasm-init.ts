// https://github.com/torch2424/wasm-by-example/blob/master/demo-util/

type ImportObjectType = {
  [key: string]: any;
}

export default async function wasmInit (wasmModuleUrl: string, importObject?: ImportObjectType){

  if (!importObject) {
    importObject = {
      env: {
        abort: () => console.log("Abort!")
      }
    };
  }

  // Check if the browser supports streaming instantiation
  if (WebAssembly.instantiateStreaming) {
    // Fetch the module, and instantiate it as it is downloading
    return await WebAssembly.instantiateStreaming(fetch(wasmModuleUrl), importObject);
  } else {
    // Fallback to using fetch to download the entire module
    // And then instantiate the module
    const fetchAndInstantiateTask = async () => {
      const wasmArrayBuffer = await fetch(wasmModuleUrl).then((response) => response.arrayBuffer());
      return WebAssembly.instantiate(wasmArrayBuffer, importObject);
    };
    return await fetchAndInstantiateTask();
  }
};
