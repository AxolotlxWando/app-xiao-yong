export interface NodeShape {
  identity: number;
  labels: [string];
  properties: any;
}

export interface RelationshipShape {
  identity: number;
  type: string;
  start: number;
  end: number;
  properties: any;
}
