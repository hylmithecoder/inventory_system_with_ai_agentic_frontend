import { InventoryDashboard } from "../../pages/inventorydashboard";
import AuthProvider from "@/app/components/authprovider";

export default function PageDashboard(){
    return <>
        <AuthProvider>
            <InventoryDashboard/>
        </AuthProvider>
    </>
}