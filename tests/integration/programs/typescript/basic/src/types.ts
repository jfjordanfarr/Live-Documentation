export interface Widget {
  id: string;
  value: number;
  state: WidgetState;
}

export enum WidgetState {
  Active = "active",
  Inactive = "inactive"
}
