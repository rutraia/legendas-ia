import { Check, MoveRight, PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function Pricing() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex text-center justify-center items-center gap-4 flex-col">
          <div className="flex gap-2 flex-col">
            <h2 className="text-gradient text-3xl md:text-4xl font-extrabold mb-6 text-center drop-shadow-xl tracking-tight">
              Pronto para turbinar suas redes sociais?
            </h2>
            {/* Parágrafo removido conforme solicitado */}
            <div className="grid pt-20 text-left grid-cols-1 lg:grid-cols-2 w-full gap-8 justify-center">
              <Card className="w-full rounded-2xl bg-gray-950/90 border border-primary/20 shadow-xl backdrop-blur-md font-sans text-gray-100">
                <CardHeader>
                  <CardTitle>
                    <span className="flex flex-row gap-4 items-center font-extrabold text-2xl tracking-tight text-primary">
                      Startup
                    </span>
                  </CardTitle>
                  <CardDescription>
                    <span className="text-base text-gray-300 font-medium">
                      Nosso objetivo é simplificar o marketing digital, tornando o processo de criar legendas para redes sociais fácil e rápido.
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-8 justify-start font-normal text-base text-gray-200">
                    <p className="flex flex-row  items-center gap-2 text-xl">
                      <span className="text-4xl">$40</span>
                      <span className="text-sm text-muted-foreground">
                        {" "}
                        / month
                      </span>
                    </p>
                    <div className="flex flex-col gap-4 justify-start">
                      <div className="flex flex-row gap-4">
                        <Check className="w-4 h-4 mt-2 text-primary" />
                        <div className="flex flex-col">
                          <p>Fast and reliable</p>
                          <p className="text-muted-foreground text-sm">
                            We&apos;ve made it fast and reliable.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row gap-4">
                        <Check className="w-4 h-4 mt-2 text-primary" />
                        <div className="flex flex-col">
                          <p>Fast and reliable</p>
                          <p className="text-muted-foreground text-sm">
                            We&apos;ve made it fast and reliable.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row gap-4">
                        <Check className="w-4 h-4 mt-2 text-primary" />
                        <div className="flex flex-col">
                          <p>Fast and reliable</p>
                          <p className="text-muted-foreground text-sm">
                            We&apos;ve made it fast and reliable.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full rounded-full font-semibold text-lg bg-primary text-white border border-primary hover:bg-primary-700 hover:border-primary-400 transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
                      size="lg"
                      onClick={() => window.location.href = '/login'}
                    >
                      Assinar agora
                      <MoveRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="w-full rounded-2xl bg-gray-950/90 border border-primary/20 shadow-xl backdrop-blur-md font-sans text-gray-100">
                <CardHeader>
                  <CardTitle>
                    <span className="flex flex-row gap-4 items-center font-extrabold text-2xl tracking-tight text-primary">
                      Growth
                    </span>
                  </CardTitle>
                  <CardDescription>
                    <span className="text-base text-gray-300 font-medium">
                      Para quem quer crescer, oferecemos recursos avançados para potencializar ainda mais sua presença digital.
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-8 justify-start font-normal text-base text-gray-200">
                    <p className="flex flex-row  items-center gap-2 text-xl">
                      <span className="text-4xl">$40</span>
                      <span className="text-sm text-muted-foreground">
                        {" "}
                        / month
                      </span>
                    </p>
                    <div className="flex flex-col gap-4 justify-start">
                      <div className="flex flex-row gap-4">
                        <Check className="w-4 h-4 mt-2 text-primary" />
                        <div className="flex flex-col">
                          <p>Fast and reliable</p>
                          <p className="text-muted-foreground text-sm">
                            We&apos;ve made it fast and reliable.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row gap-4">
                        <Check className="w-4 h-4 mt-2 text-primary" />
                        <div className="flex flex-col">
                          <p>Fast and reliable</p>
                          <p className="text-muted-foreground text-sm">
                            We&apos;ve made it fast and reliable.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row gap-4">
                        <Check className="w-4 h-4 mt-2 text-primary" />
                        <div className="flex flex-col">
                          <p>Fast and reliable</p>
                          <p className="text-muted-foreground text-sm">
                            We&apos;ve made it fast and reliable.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full rounded-full font-semibold text-lg bg-primary text-white border border-primary hover:bg-primary-700 hover:border-primary-400 transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
                      size="lg"
                      onClick={() => window.location.href = '/login'}
                    >
                      Assinar agora
                      <MoveRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Pricing };
