import AuthProvider from "@/app/components/authprovider";
import SettingsPage from "@/app/pages/settingspage";

export default function Settings() {
  return (
    <>
      <AuthProvider>
        <SettingsPage />
      </AuthProvider>
    </>
  )
}