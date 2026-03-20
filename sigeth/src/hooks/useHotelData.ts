import { useContext } from "react";
import {
    HotelDataContext,
    type HotelDataContextType,
} from "../context/hotelDataContextDef";

export function useHotelData(): HotelDataContextType {
    const context = useContext(HotelDataContext);
    if (!context)
        throw new Error("useHotelData must be used within HotelDataProvider");
    return context;
}
