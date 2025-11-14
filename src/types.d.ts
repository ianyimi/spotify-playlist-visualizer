import { type ThreeElements } from "@react-three/fiber"
export type GroupProps = ThreeElements["group"]
export type PickRequired<T, Required extends keyof T> = Partial<Omit<T, Required>> & Pick<T, Required>
