/**
 * Constructs a new File Object from some data
 *
 * @param {string} filename the name of the returned file
 * @param {Array<ArrayBufferView | ArrayBuffer | string>} data this is data you want the file to contain
 * @param {BlobPropertyBag & FilePropertyBag} propertyBag optional meta data: - MIME type, - last mofified date, - ending type (either "native" or "transparent")
 *
 * @example <caption>Basic usage with plain text</caption>
 * createFileFromData("test.txt", ["test time"], {type: "text/plain"})
 */
export function createFileFromData<T extends BlobPart>(
  filename: string,
  data: Array<T>,
  propertyBag?: BlobPropertyBag & FilePropertyBag
): File {
  return new File([new Blob(data, propertyBag)], filename, propertyBag);
}
