export const VehicleTypes = ["Sedan", "SUV", "Motorbike", "Truck", "Van", "Bus"] as const;
export type VehicleType = typeof VehicleTypes[number];

export const VehicleStatuses = ["Active", "Deleted"] as const;
export type VehicleStatus = typeof VehicleStatuses[number];

export const VehicleHistoryActions = ["Created", "Assigned", "Deleted", "Edited"] as const;
export type VehicleHistoryAction = typeof VehicleHistoryActions[number];

export interface IVehicleHistory {
  action: VehicleHistoryAction;
  actor: string;
  message: string;
  timestamp: string;
}

export interface IVehicle {
  _id: string;
  numberPlate: string;
  vehicleType: VehicleType;
  organization: string;
  drivers: string[];
  status: VehicleStatus;
  history?: IVehicleHistory[];
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}