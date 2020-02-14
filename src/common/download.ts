//downloadocument.js v3.0, by dandavis; 2008-2014. [CCBY2] see http://danml.com/downloadocument.html for tests/usage
// v1 landed a FF+Chrome compat way of downloading strings to local un-named files, upgraded to use a hidden frame and optional mime
// v2 added named files via a[download], msSaveBlob, IE (10+) support, and window.URL support for larger+faster saves than dataURLs
// v3 added dataURL and Blob Input, bind-toggle arity, and legacy dataURL fallback was improved with force-download mime and base64 support

// data can be a string, Blob, File, or dataURL

import {MimeType, IMimes} from './mime-type';

export function download(data: string|Blob|File|URL, strFileName: string, strMimeType: MimeType) {

  let u = "application/octet-stream"; // this default mime also triggers iframe downloads
  let m = strMimeType || u;
  let x = data;
  let a = document.createElement("a");
  let z = (a: any) => String(a);
  //@ts-ignore
  let B = window.Blob || window.MozBlob || window.WebKitBlob || z;
  //@ts-ignore
  let BB = window.MSBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;
  let fn = strFileName || "download";
  let blob;
  let b;
  let ua;
  let fr;

  //if(typeof B.bind === 'function' ){ B=B.bind(window); }

  if (String(this) === "true") {
    //reverse arguments, allowing downloadocument.bind(true, "text/xml", "export.xml") to act as a callback
    //@ts-ignore
    x = [x, m];
    m = x[0];
    x = x[1];
  }

  //go ahead and download dataURLs right away
  if (String(x).match(/^data\:[\w+\-]+\/[\w+\-]+[,;]/)) {
    return navigator.msSaveBlob // IE10 can't do a[download], only Blobs:
      ? navigator.msSaveBlob(d2b(x), fn)
       //@ts-ignore
      : saver(x); // everyone else can save dataURLs un-processed
  } //end if dataURL passed?

  try {
        //@ts-ignore
        blob = x instanceof B ? x : new B([x], { type: m });
      } catch (y) {
    if (BB) {
      b = new BB();
      b.append([x]);
      blob = b.getBlob(m); // the blob
    }
  }

  function d2b(u) {
    var p = u.split(/[:;,]/),
      t = p[1],
      dec = p[2] == "base64" ? atob : decodeURIComponent,
      bin = dec(p.pop()),
      mx = bin.length,
      i = 0,
      uia = new Uint8Array(mx);

    for (i; i < mx; ++i) uia[i] = bin.charCodeAt(i);

    return new B([uia], { type: t });
  }

  function saver(url, winMode) {
    if ("download" in a) {
      //html5 A[download]
      a.href = url;
      a.setAttribute("download", fn);
      a.innerHTML = "downloading...";
      document.body.appendChild(a);
      setTimeout(function() {
        a.click();
        document.body.removeChild(a);
        if (winMode === true) {
          setTimeout(function() {
            window.URL.revokeObjectURL(a.href);
          }, 250);
        }
      }, 66);
      return true;
    }

    //do iframe dataURL download (old ch+FF):
    var f = document.createElement("iframe");
    document.body.appendChild(f);
    if (!winMode) {
      // force a mime that will download:
      url = "data:" + url.replace(/^data:([\w\/\-\+]+)/, u);
    }

    f.src = url;
    setTimeout(function() {
      document.body.removeChild(f);
    }, 333);
  } //end saver

  if (navigator.msSaveBlob) {
    // IE10+ : (has Blob, but not a[download] or URL)
    return navigator.msSaveBlob(blob, fn);
  }

  if (window.URL) {
    // simple fast and modern way using Blob and URL:
    saver(window.URL.createObjectURL(blob), true);
  } else {
    // handle non-Blob()+non-URL browsers:
    if (typeof blob === "string" || blob.constructor === z) {
      try {
            //@ts-ignore
            return saver("data:" + m + ";base64," + window.btoa(blob));
      } catch (y) {
                    //@ts-ignore
                    return saver("data:" + m + "," + encodeURIComponent(blob));
                  }
    }

    // Blob but not URL:
    fr = new FileReader();
    fr.onload = function (e) {
                               //@ts-ignore
                               saver(this.result);
                             };
    fr.readAsDataURL(blob);
  }
  return true;
} /* end download() */
