import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const DEMO_LEGENDA =
  `✨ Transforme suas ideias em soluções digitais inovadoras! 🚀 Estamos com uma promoção incrível para a criação de aplicativos web que vão elevar a eficiência da sua empresa.\n\nNosso time de especialistas está pronto para desenvolver uma plataforma sob medida, alinhada com suas necessidades e objetivos. 👇\n\nEntre em contato e dê o primeiro passo rumo ao futuro da sua empresa! 🟦\n#Inovação #AplicativosWeb #Tecnologia #TransformaçãoDigital #Promoção`;

export function DemoGeradorLegendas() {
  const [loading, setLoading] = useState(false);
  const [legenda, setLegenda] = useState("");

  const gerarLegenda = () => {
    setLoading(true);
    setLegenda("");
    setTimeout(() => {
      // Efeito de "typewriter"
      let i = 0;
      const interval = setInterval(() => {
        setLegenda(DEMO_LEGENDA.slice(0, i));
        i++;
        if (i > DEMO_LEGENDA.length) clearInterval(interval);
      }, 12);
      setLoading(false);
    }, 1200);
  };

  return (
    <section className="bg-[#151827] text-white rounded-2xl p-0 my-12 max-w-5xl mx-auto border-0 relative flex flex-col md:flex-row gap-6 shadow-lg">
      <Badge className="absolute top-4 right-4 bg-[#A78BFA] text-white" variant="secondary">DEMO</Badge>
      <div className="flex-1 flex flex-col gap-2 p-6 bg-[#181C2F] rounded-2xl border border-[#2D3258]">
        <h3 className="text-xl font-bold mb-4 text-white">Criar Nova Legenda</h3>
        {/* Simulação do formulário */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-zinc-400 mb-1">Cliente</label>
          <select disabled className="w-full rounded-lg border border-[#2D3258] px-3 py-2 text-white bg-[#151827]">
            <option>Rutra IA</option>
          </select>
        </div>
        <div className="mb-4">
          <div className="rounded-lg bg-[#3B3F6B] p-3 border border-[#2D3258]">
            <div className="mb-1 text-xs font-bold text-white">Persona do Cliente</div>
            <div className="flex flex-col md:flex-row md:justify-between gap-2 text-xs">
              <div>
                <div><span className="font-semibold text-white">Tom de Voz:</span> Profissional e inovador</div>
                <div><span className="font-semibold text-white">Público-Alvo:</span> Empresas e profissionais que buscam inovação tecnológica.</div>
              </div>
              <div>
                <div><span className="font-semibold text-white">Valores:</span> Inovação, eficiência e orientação ao cliente.</div>
                <div><span className="font-semibold text-white">Palavras-Chave:</span> <span className="inline-flex gap-1">
                  <Badge variant="outline">inovação</Badge>
                  <Badge variant="outline">solução</Badge>
                  <Badge variant="outline">tecnologia</Badge>
                  <Badge variant="outline">futuro</Badge>
                </span></div>
              </div>
            </div>
            <div className="mt-1 text-[11px] text-[#C3C6F1]">Estas informações da persona serão usadas para personalizar a legenda</div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-zinc-400 mb-1">Plataforma</label>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled className="bg-[#A78BFA] text-white">Instagram</Button>
            <Button size="sm" variant="outline" disabled className="border-[#2D3258] text-[#C3C6F1]">Facebook</Button>
            <Button size="sm" variant="outline" disabled className="border-[#2D3258] text-[#C3C6F1]">LinkedIn</Button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-zinc-400 mb-1">O que você deseja comunicar?</label>
          <textarea
            disabled
            className="w-full rounded-lg border border-[#2D3258] px-3 py-2 min-h-[48px] text-white bg-[#151827]"
            value="Promoção de criação de aplicativos web"
          />
        </div>
        <Button onClick={gerarLegenda} className="w-full mt-4 bg-[#A78BFA] text-white hover:bg-[#BFA5FA] border-0" disabled={loading}>
          {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4 inline" />Gerando...</> : "Gerar Legenda"}
        </Button>
      </div>
      {/* Simulação do resultado */}
      <div className="flex-1 flex flex-col gap-2 p-6 bg-[#181C2F] rounded-2xl border border-[#2D3258]">
        <h3 className="text-xl font-bold mb-4 text-white">Legenda Gerada</h3>
        <div className="bg-[#151827] rounded-lg p-4 text-sm mb-3 border border-[#2D3258] min-h-[180px] flex items-center">
          {loading ? (
            <div className="flex items-center justify-center w-full text-zinc-400"><Loader2 className="animate-spin mr-2 h-5 w-5" />Gerando legenda...</div>
          ) : (
            <span style={{ whiteSpace: "pre-line" }}>{legenda}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button disabled variant="outline" className="border-[#2D3258] text-[#C3C6F1]">Copiar</Button>
          <Button disabled variant="outline" className="border-[#2D3258] text-[#C3C6F1]">Salvar</Button>
          <Button disabled variant="outline" className="border-[#2D3258] text-[#C3C6F1]">Ver Cliente</Button>
        </div>
      </div>
    </section>
  );
}
