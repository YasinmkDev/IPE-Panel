import { DeviceQRCode } from "@/components/common/DeviceQRCode";

interface DeviceLinkTabProps {
    pairingCode: string;
}

export function DeviceLinkTab({ pairingCode }: DeviceLinkTabProps) {
    return <DeviceQRCode pairingCode={pairingCode} />;
}
