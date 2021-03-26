export interface AcousticMaterial {
  tags: string[];
  manufacturer: string;
  name: string;
  material: string;
  absorption: {
    "63": number;
    "125": number;
    "250": number;
    "500": number;
    "1000": number;
    "2000": number;
    "4000": number;
    "8000": number;
  };
  nrc: number;
  source: string;
  description: string;
  uuid: string;
}
