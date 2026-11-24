import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ContactForm, SUPPORT_EMAIL } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Meridian University registrar and support desk.",
  openGraph: { title: "Contact Meridian University", description: "Registrar and support desk." },
};

const INFO = [
  { icon: Mail, label: "Email", value: SUPPORT_EMAIL },
  { icon: Clock, label: "Support hours", value: "Sun–Thu, 9:00–17:00 (GMT+6)" },
  { icon: MapPin, label: "Registrar's office", value: "Main Hall, Ground Floor" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <h1 className="text-4xl font-semibold">Contact the registrar</h1>
        <p className="mt-3 text-muted-foreground">Questions about enrollment, payments or your account? Send us a note.</p>
        <ul className="mt-8 space-y-5">
          {INFO.map((i) => (
            <li key={i.label} className="flex items-start gap-3">
              <span className="rounded-lg bg-primary/10 p-2 text-primary"><i.icon className="size-4" /></span>
              <div>
                <p className="text-sm font-medium">{i.label}</p>
                <p className="text-sm text-muted-foreground">{i.value}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Card className="p-6">
        <ContactForm />
      </Card>
    </div>
  );
}
