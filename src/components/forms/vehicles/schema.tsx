import * as yup from "yup"
import { VehicleTypes } from "@/lib/types/vehicle.type";

export const CreateVehicleInitialValues = {
  numberPlate: "",
  vehicleType: "",
  drivers: [],
}

export const CreateVehicleSchema = yup.object({
  numberPlate: yup.string().max(255, "Number Plate is too long").required(),
  vehicleType: yup.string().oneOf(VehicleTypes).required(),
  drivers: yup.array().of(yup.string()).default([]),
})

export const EditVehicleInitialValues = {
  numberPlate: "",
  vehicleType: "",
}

export const EditVehicleSchema = yup.object({
  numberPlate: yup.string().max(255, "Number Plate is too long").required(),
  vehicleType: yup.string().oneOf(VehicleTypes).required(),
})