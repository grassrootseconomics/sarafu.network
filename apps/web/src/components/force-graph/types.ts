export interface Node {
  id: `0x${string}`;
  value: number;
}
export interface Link {
  source: Node;
  target: Node;
  voucher_address: `0x${string}`;
}
export interface GraphData {
  nodes: Node[];
  links: Link[];
}