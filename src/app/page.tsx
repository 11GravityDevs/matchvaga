import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-base leading-normal font-medium group-data-[size=sm]/card:text-sm">
              MatchVaga
            </h1>
          </CardTitle>
          <CardDescription>
            Analise o gap entre seu currículo e a descrição da vaga. Identifique
            habilidades em falta e gere um documento otimizado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Começar</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
