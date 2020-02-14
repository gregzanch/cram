
export interface IMimes {
    AAC: string;
    ABW: string;
    ARC: string;
    AVI: string;
    AZW: string;
    BIN: string;
    BMP: string;
    BZ: string;
    BZ2: string;
    CSH: string;
    CSS: string;
    CSV: string;
    DOC: string;
    DOCX: string;
    EOT: string;
    EPUB: string;
    GZ: string;
    GIF: string;
    HTM: string;
    HTML: string;
    ICO: string;
    ICS: string;
    JAR: string;
    JPEG: string;
    JPG: string;
    JS: string;
    JSON: string;
    JSONLD: string;
    MID: string;
    MIDI: string;
    MJS: string;
    MP3: string;
    MPEG: string;
    MPKG: string;
    ODP: string;
    ODS: string;
    ODT: string;
    OGA: string;
    OGV: string;
    OGX: string;
    OPUS: string;
    OTF: string;
    PNG: string;
    PDF: string;
    PHP: string;
    PPT: string;
    PPTX: string;
    RAR: string;
    RTF: string;
    SH: string;
    SVG: string;
    SWF: string;
    TAR: string;
    TIF: string;
    TIFF: string;
    TS: string;
    TTF: string;
    TXT: string;
    VSD: string;
    WAV: string;
    WEBA: string;
    WEBM: string;
    WEBP: string;
    WOFF: string;
    WOFF2: string;
    XHTML: string;
    XLS: string;
    XLSX: string;
    XML: string;
    XUL: string;
    ZIP: string;
    "7Z": string;
}

const Mimes: IMimes = {
  /**
   * AAC audio
   */ AAC: "audio/aac",
  /**
   * AbiWord document
   */ ABW: "application/x-abiword",
  /**
   * Archive document (multiple files embedded)
   */ ARC: "application/x-freearc",
  /**
   * AVI: Audio Video Interleave
   */ AVI: "video/x-msvideo",
  /**
   * Amazon Kindle eBook format
   */ AZW: "application/vnd.amazon.ebook",
  /**
   * Any kind of binary data
   */ BIN: "application/octet-stream",
  /**
   * Windows OS/2 Bitmap Graphics
   */ BMP: "image/bmp",
  /**
   * BZip archive
   */ BZ: "application/x-bzip",
  /**
   * BZip2 archive
   */ BZ2: "application/x-bzip2",
  /**
   * C-Shell script
   */ CSH: "application/x-csh",
  /**
   * Cascading Style Sheets (CSS)
   */ CSS: "text/css",
  /**
   * Comma-separated values (CSV)
   */ CSV: "text/csv",
  /**
   * Microsoft Word
   */ DOC: "application/msword",
  /**
   * Microsoft Word (OpenXML)
   */ DOCX:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  /**
   * MS Embedded OpenType fonts
   */ EOT: "application/vnd.ms-fontobject",
  /**
   * Electronic publication (EPUB)
   */ EPUB: "application/epub+zip",
  /**
   * GZip Compressed Archive
   */ GZ: "application/gzip",
  /**
   * Graphics Interchange Format (GIF)
   */ GIF: "image/gif",
  /**
   * HyperText Markup Language (HTML)
   */ HTM: "text/html",
  /**
   * HyperText Markup Language (HTML)
   */ HTML: "text/html",
  /**
   * Icon format
   */ ICO: "image/vnd.microsoft.icon",
  /**
   * iCalendar format
   */ ICS: "text/calendar",
  /**
   * Java Archive (JAR)
   */ JAR: "application/java-archive",
  /**
   * JPEG images
   */ JPEG: "image/jpeg",
  /**
   * JPEG images
   */ JPG: "image/jpeg",
  /**
   * JavaScript
   */ JS: "text/javascript",
  /**
   * JSON format
   */ JSON: "application/json",
  /**
   * JSON-LD format
   */ JSONLD: "application/ld+json",
  /**
   * Musical Instrument Digital Interface (MIDI)
   */ MID: "audio/midi audio/x-midi",
  /**
   * Musical Instrument Digital Interface (MIDI)
   */ MIDI: "audio/midi audio/x-midi",
  /**
   * JavaScript module
   */ MJS: "text/javascript",
  /**
   * MP3 audio
   */ MP3: "audio/mpeg",
  /**
   * MPEG Video
   */ MPEG: "video/mpeg",
  /**
   * Apple Installer Package
   */ MPKG: "application/vnd.apple.installer+xml",
  /**
   * OpenDocument presentation document
   */ ODP: "application/vnd.oasis.opendocument.presentation",
  /**
   * OpenDocument spreadsheet document
   */ ODS: "application/vnd.oasis.opendocument.spreadsheet",
  /**
   * OpenDocument text document
   */ ODT: "application/vnd.oasis.opendocument.text",
  /**
   * OGG audio
   */ OGA: "audio/ogg",
  /**
   * OGG video
   */ OGV: "video/ogg",
  /**
   * OGG
   */ OGX: "application/ogg",
  /**
   * Opus audio
   */ OPUS: "audio/opus",
  /**
   * OpenType font
   */ OTF: "font/otf",
  /**
   * Portable Network Graphics
   */ PNG: "image/png",
  /**
   * Adobe Portable Document Format (PDF)
   */ PDF: "application/pdf",
  /**
   * Hypertext Preprocessor (Personal Home Page)
   */ PHP: "application/php",
  /**
   * Microsoft PowerPoint
   */ PPT: "application/vnd.ms-powerpoint",
  /**
   * Microsoft PowerPoint (OpenXML)
   */ PPTX:
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  /**
   * RAR archive
   */ RAR: "application/vnd.rar",
  /**
   * Rich Text Format (RTF)
   */ RTF: "application/rtf",
  /**
   * Bourne shell script
   */ SH: "application/x-sh",
  /**
   * Scalable Vector Graphics (SVG)
   */ SVG: "image/svg+xml",
  /**
   * Small web format (SWF) or Adobe Flash document
   */ SWF: "application/x-shockwave-flash",
  /**
   * Tape Archive (TAR)
   */ TAR: "application/x-tar",
  /**
   * Tagged Image File Format (TIFF)
   */ TIF: "image/tiff",
  /**
   * Tagged Image File Format (TIFF)
   */ TIFF: "image/tiff",
  /**
   * MPEG transport stream
   */ TS: "video/mp2t",
  /**
   * TrueType Font
   */ TTF: "font/ttf",
  /**
   * Text, (generally ASCII or ISO 8859-n)
   */ TXT: "text/plain",
  /**
   * Microsoft Visio
   */ VSD: "application/vnd.visio",
  /**
   * Waveform Audio Format
   */ WAV: "audio/wav",
  /**
   * WEBM audio
   */ WEBA: "audio/webm",
  /**
   * WEBM video
   */ WEBM: "video/webm",
  /**
   * WEBP image
   */ WEBP: "image/webp",
  /**
   * Web Open Font Format (WOFF)
   */ WOFF: "font/woff",
  /**
   * Web Open Font Format (WOFF)
   */ WOFF2: "font/woff2",
  /**
   * XHTML
   */ XHTML: "application/xhtml+xml",
  /**
   * Microsoft Excel
   */ XLS: "application/vnd.ms-excel",
  /**
   * Microsoft Excel (OpenXML)
   */ XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  /**
   * XML
   */ XML: "application/xml",
  /**
   * XUL
   */ XUL: "application/vnd.mozilla.xul+xml",
  /**
   * ZIP archive
   */ ZIP: "application/zip",
  /**
   * 7-zip archive
   */ "7Z": "application/x-7z-compressed"
};

export let MimeType: keyof IMimes;

export default Mimes;
