import { type ReactNode } from "react";

export function renderPopulatedObject<T>({
  data, 
  whenId,
  whenObject,
  defaultValue,
}: {
  data?: string | T,   
  whenId: (id: string) => ReactNode,
  whenObject: (obj: T) => ReactNode,
  defaultValue?: string
}){

  if(!data) return defaultValue || "Unavailable"; 

  if(typeof data === 'string'){
    return whenId(data)
  }
  
  return whenObject(data);
}