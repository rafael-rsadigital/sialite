import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Save, ArrowLeft, Shield } from "lucide-react";

const AdminCadastro = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    hash_secreto: "",
    nome_exibicao: "",
    link_google: "",
    whatsapp_empresa: "",
    email_empresa: "",
    modelo_sugestao: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.slug || !formData.hash_secreto || !formData.nome_exibicao || !formData.link_google || !formData.whatsapp_empresa) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from("empresas").insert({
        slug: formData.slug.toLowerCase().trim(),
        hash_secreto: formData.hash_secreto.trim(),
        nome_exibicao: formData.nome_exibicao.trim(),
        link_google: formData.link_google.trim(),
        whatsapp_empresa: formData.whatsapp_empresa.replace(/\D/g, ""),
        email_empresa: formData.email_empresa.trim() || null,
        modelo_sugestao: formData.modelo_sugestao.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Empresa cadastrada com sucesso!",
        description: `${formData.nome_exibicao} foi adicionada ao sistema.`,
      });

      // Limpa o formulário
      setFormData({
        slug: "",
        hash_secreto: "",
        nome_exibicao: "",
        link_google: "",
        whatsapp_empresa: "",
        email_empresa: "",
        modelo_sugestao: "",
      });
    } catch (error: any) {
      console.error("Erro ao cadastrar empresa:", error);
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Ocorreu um erro ao salvar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Área Administrativa</span>
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Cadastrar Nova Empresa</CardTitle>
                <CardDescription className="text-white/60 mt-1">
                  Preencha os dados para adicionar uma empresa ao sistema SIA
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-white/80 font-medium">
                  Slug <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="nome-da-empresa"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                />
                <p className="text-xs text-white/40">Identificador único para a URL (ex: /av/nome-da-empresa)</p>
              </div>

              {/* Hash Secreto */}
              <div className="space-y-2">
                <Label htmlFor="hash_secreto" className="text-white/80 font-medium">
                  Hash Secreto <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="hash_secreto"
                  name="hash_secreto"
                  value={formData.hash_secreto}
                  onChange={handleChange}
                  placeholder="codigo-secreto-123"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                />
                <p className="text-xs text-white/40">Código de acesso ao dashboard da empresa</p>
              </div>

              {/* Nome de Exibição */}
              <div className="space-y-2">
                <Label htmlFor="nome_exibicao" className="text-white/80 font-medium">
                  Nome de Exibição <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="nome_exibicao"
                  name="nome_exibicao"
                  value={formData.nome_exibicao}
                  onChange={handleChange}
                  placeholder="Grazielle Diniz - Estética"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                />
                <p className="text-xs text-white/40">Nome que aparecerá para os clientes no sistema</p>
              </div>

              {/* Link Google */}
              <div className="space-y-2">
                <Label htmlFor="link_google" className="text-white/80 font-medium">
                  Link Google Meu Negócio <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="link_google"
                  name="link_google"
                  value={formData.link_google}
                  onChange={handleChange}
                  placeholder="https://g.page/r/..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                />
                <p className="text-xs text-white/40">URL da ficha do Google para avaliações</p>
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp_empresa" className="text-white/80 font-medium">
                  WhatsApp da Empresa <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="whatsapp_empresa"
                  name="whatsapp_empresa"
                  value={formData.whatsapp_empresa}
                  onChange={handleChange}
                  placeholder="11999999999"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                />
                <p className="text-xs text-white/40">Apenas números com DDD</p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email_empresa" className="text-white/80 font-medium">
                  E-mail da Empresa <span className="text-white/40">(opcional)</span>
                </Label>
                <Input
                  id="email_empresa"
                  name="email_empresa"
                  type="email"
                  value={formData.email_empresa}
                  onChange={handleChange}
                  placeholder="contato@empresa.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                />
              </div>

              {/* Modelo Sugestão */}
              <div className="space-y-2">
                <Label htmlFor="modelo_sugestao" className="text-white/80 font-medium">
                  Modelo de Sugestão <span className="text-white/40">(opcional)</span>
                </Label>
                <Textarea
                  id="modelo_sugestao"
                  name="modelo_sugestao"
                  value={formData.modelo_sugestao}
                  onChange={handleChange}
                  placeholder="Texto modelo que servirá de inspiração para os clientes escreverem suas avaliações..."
                  rows={5}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none"
                />
                <p className="text-xs text-white/40">Texto de exemplo para inspirar avaliações dos clientes</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Cadastrar Empresa
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-white/30 text-sm mt-8">
          SIA - Sistema Inteligente de Avaliações
        </p>
      </div>
    </div>
  );
};

export default AdminCadastro;
