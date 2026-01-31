import { useState, useEffect } from "react";
import { Shield, Lock, Users, AlertTriangle, DollarSign, ExternalLink, Calendar, Zap, Building2, UserPlus, LayoutDashboard, Save, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Empresa {
  id: string;
  nome_exibicao: string;
  slug: string;
  hash_secreto: string;
  status_assinatura: boolean;
  data_vencimento: string | null;
  valor_assinatura: number | null;
  link_asaas: string | null;
  link_google: string | null;
  whatsapp_empresa: string | null;
  email_empresa: string | null;
  modelo_sugestao: string | null;
  gestor_id: string | null;
  created_at: string;
}

interface Gestor {
  id: string;
  nome: string;
  email: string | null;
  hash_acesso: string;
  created_at: string;
}

const ADMIN_PASSWORD = "RSASuce$$o2026";

export default function AdminRSA() {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Form states - Gestor
  const [gestorForm, setGestorForm] = useState({ nome: "", email: "", hash_acesso: "" });
  const [savingGestor, setSavingGestor] = useState(false);

  // Form states - Empresa
  const [empresaForm, setEmpresaForm] = useState({
    nome_exibicao: "",
    slug: "",
    hash_secreto: "",
    link_google: "",
    link_asaas: "",
    valor_assinatura: "",
    data_vencimento: "",
    gestor_id: "",
    whatsapp_empresa: "",
    email_empresa: "",
    modelo_sugestao: "",
  });
  const [savingEmpresa, setSavingEmpresa] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senha === ADMIN_PASSWORD) {
      setAutenticado(true);
      setErroSenha("");
    } else {
      setErroSenha("Palavra-chave incorreta");
    }
  };

  useEffect(() => {
    if (autenticado) {
      fetchData();
    }
  }, [autenticado]);

  const fetchData = async () => {
    setLoading(true);
    const [empresasRes, gestoresRes] = await Promise.all([
      supabase.from("empresas").select("*").order("created_at", { ascending: false }),
      supabase.from("gestores").select("*").order("created_at", { ascending: false }),
    ]);

    if (empresasRes.error) toast.error("Erro ao carregar empresas");
    else setEmpresas(empresasRes.data || []);

    if (gestoresRes.error) toast.error("Erro ao carregar gestores");
    else setGestores(gestoresRes.data || []);

    setLoading(false);
  };

  const toggleStatus = async (id: string, novoStatus: boolean) => {
    const { error } = await supabase
      .from("empresas")
      .update({ status_assinatura: novoStatus })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      setEmpresas(empresas.map(e => e.id === id ? { ...e, status_assinatura: novoStatus } : e));
      toast.success(novoStatus ? "Assinatura ativada" : "Assinatura desativada");
    }
  };

  const updateDataVencimento = async (id: string, data: string) => {
    const { error } = await supabase
      .from("empresas")
      .update({ data_vencimento: data || null })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar data");
    } else {
      setEmpresas(empresas.map(e => e.id === id ? { ...e, data_vencimento: data || null } : e));
      toast.success("Data de vencimento atualizada");
    }
  };

  const isVencida = (dataVencimento: string | null) => {
    if (!dataVencimento) return false;
    return new Date(dataVencimento) < new Date();
  };

  // Salvar Gestor
  const handleSaveGestor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gestorForm.nome.trim() || !gestorForm.hash_acesso.trim()) {
      toast.error("Nome e ID Único são obrigatórios");
      return;
    }

    setSavingGestor(true);
    const { data, error } = await supabase.from("gestores").insert({
      nome: gestorForm.nome.trim(),
      email: gestorForm.email.trim() || null,
      hash_acesso: gestorForm.hash_acesso.trim(),
    }).select().single();

    if (error) {
      toast.error(error.message.includes("duplicate") ? "ID Único já existe" : "Erro ao salvar gestor");
    } else {
      toast.success("Gestor cadastrado com sucesso!");
      setGestores([data, ...gestores]);
      setGestorForm({ nome: "", email: "", hash_acesso: "" });
    }
    setSavingGestor(false);
  };

  const deleteGestor = async (id: string) => {
    const { error } = await supabase.from("gestores").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir gestor");
    } else {
      setGestores(gestores.filter(g => g.id !== id));
      toast.success("Gestor excluído");
    }
  };

  // Salvar Empresa
  const handleSaveEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaForm.nome_exibicao.trim() || !empresaForm.slug.trim() || !empresaForm.hash_secreto.trim()) {
      toast.error("Nome, Slug e Hash são obrigatórios");
      return;
    }

    setSavingEmpresa(true);
    const { data, error } = await supabase.from("empresas").insert({
      nome_exibicao: empresaForm.nome_exibicao.trim(),
      slug: empresaForm.slug.toLowerCase().trim(),
      hash_secreto: empresaForm.hash_secreto.trim(),
      link_google: empresaForm.link_google.trim() || null,
      link_asaas: empresaForm.link_asaas.trim() || null,
      valor_assinatura: empresaForm.valor_assinatura ? parseFloat(empresaForm.valor_assinatura) : null,
      data_vencimento: empresaForm.data_vencimento || null,
      gestor_id: empresaForm.gestor_id || null,
      whatsapp_empresa: empresaForm.whatsapp_empresa.replace(/\D/g, "") || null,
      email_empresa: empresaForm.email_empresa.trim() || null,
      modelo_sugestao: empresaForm.modelo_sugestao.trim() || null,
    }).select().single();

    if (error) {
      toast.error(error.message.includes("duplicate") ? "Slug já existe" : "Erro ao salvar empresa");
    } else {
      toast.success("Empresa cadastrada com sucesso!");
      setEmpresas([data, ...empresas]);
      setEmpresaForm({
        nome_exibicao: "",
        slug: "",
        hash_secreto: "",
        link_google: "",
        link_asaas: "",
        valor_assinatura: "",
        data_vencimento: "",
        gestor_id: "",
        whatsapp_empresa: "",
        email_empresa: "",
        modelo_sugestao: "",
      });
    }
    setSavingEmpresa(false);
  };

  // Métricas
  const assinaturasAtivas = empresas.filter(e => e.status_assinatura).length;
  const vencidasInadimplentes = empresas.filter(e => !e.status_assinatura || isVencida(e.data_vencimento)).length;
  const mrr = empresas
    .filter(e => e.status_assinatura)
    .reduce((acc, e) => acc + (e.valor_assinatura || 0), 0);

  const getGestorNome = (gestorId: string | null) => {
    if (!gestorId) return "—";
    const gestor = gestores.find(g => g.id === gestorId);
    return gestor?.nome || "—";
  };

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center relative overflow-hidden p-4">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <Card className="relative bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20 max-w-md w-full animate-fade-in">
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 mb-6">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Painel RSA Digital</h1>
            <p className="text-slate-400 mb-8">Digite a palavra-chave do administrador</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Palavra-Chave do Administrador"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErroSenha(""); }}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 focus:border-violet-500/50 focus:ring-violet-500/20"
              />

              {erroSenha && (
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {erroSenha}
                </p>
              )}

              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-violet-500/25">
                <Shield className="w-5 h-5 mr-2" />
                Acessar Painel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Painel RSA Digital</h1>
                <p className="text-slate-400 text-sm">Gestão Completa do SIA</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
            <TabsList className="bg-white/5 border border-white/10 p-1 mb-6">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-white text-slate-400">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="gestores" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-white text-slate-400">
                <UserPlus className="w-4 h-4 mr-2" />
                Gestores
              </TabsTrigger>
              <TabsTrigger value="empresas" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-white text-slate-400">
                <Building2 className="w-4 h-4 mr-2" />
                Cadastro Empresas
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl shadow-emerald-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Assinaturas Ativas</p>
                        <p className="text-3xl font-bold text-white">{assinaturasAtivas}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl shadow-red-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Vencidas/Inadimplentes</p>
                        <p className="text-3xl font-bold text-white">{vencidasInadimplentes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl shadow-cyan-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Receita Recorrente (MRR)</p>
                        <p className="text-3xl font-bold text-white">
                          R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Empresas Table */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-violet-400" />
                    Gestão de Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                  ) : empresas.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">Nenhuma empresa cadastrada</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-slate-400">Empresa</TableHead>
                            <TableHead className="text-slate-400">Gestor</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-slate-400">Vencimento</TableHead>
                            <TableHead className="text-slate-400">Valor</TableHead>
                            <TableHead className="text-slate-400">Pagamento</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {empresas.map((empresa) => {
                            const vencida = isVencida(empresa.data_vencimento);
                            const emDia = empresa.status_assinatura && !vencida;
                            
                            return (
                              <TableRow 
                                key={empresa.id} 
                                className={`border-white/10 transition-colors ${
                                  vencida 
                                    ? 'bg-red-500/10 hover:bg-red-500/15' 
                                    : emDia 
                                      ? 'bg-emerald-500/5 hover:bg-emerald-500/10' 
                                      : 'hover:bg-white/5'
                                }`}
                              >
                                <TableCell className="text-white font-medium">
                                  <div>
                                    <p>{empresa.nome_exibicao}</p>
                                    <p className="text-xs text-slate-500">{empresa.slug}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-slate-400">
                                  {getGestorNome(empresa.gestor_id)}
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    checked={empresa.status_assinatura}
                                    onCheckedChange={(checked) => toggleStatus(empresa.id, checked)}
                                    className="data-[state=checked]:bg-emerald-500"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    <input
                                      type="date"
                                      value={empresa.data_vencimento || ""}
                                      onChange={(e) => updateDataVencimento(empresa.id, e.target.value)}
                                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-violet-500/50"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  R$ {(empresa.valor_assinatura || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell>
                                  {empresa.link_asaas ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-white/10 text-white hover:bg-white/10"
                                      onClick={() => window.open(empresa.link_asaas!, '_blank')}
                                    >
                                      <ExternalLink className="w-4 h-4 mr-1" />
                                      Abrir
                                    </Button>
                                  ) : (
                                    <span className="text-slate-500 text-sm">—</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gestores Tab */}
            <TabsContent value="gestores" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Form */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-violet-400" />
                      Novo Gestor
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Cadastre novos parceiros gestores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveGestor} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white/80">Nome <span className="text-red-400">*</span></Label>
                        <Input
                          value={gestorForm.nome}
                          onChange={(e) => setGestorForm({ ...gestorForm, nome: e.target.value })}
                          placeholder="Nome do gestor"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">E-mail</Label>
                        <Input
                          type="email"
                          value={gestorForm.email}
                          onChange={(e) => setGestorForm({ ...gestorForm, email: e.target.value })}
                          placeholder="email@exemplo.com"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">ID Único (Chave de Acesso) <span className="text-red-400">*</span></Label>
                        <Input
                          value={gestorForm.hash_acesso}
                          onChange={(e) => setGestorForm({ ...gestorForm, hash_acesso: e.target.value })}
                          placeholder="chave-unica-gestor"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <Button type="submit" disabled={savingGestor} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                        {savingGestor ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Cadastrar Gestor
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Gestores List */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-violet-400" />
                      Gestores Cadastrados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {gestores.length === 0 ? (
                      <p className="text-slate-400 text-center py-8">Nenhum gestor cadastrado</p>
                    ) : (
                      <div className="space-y-3">
                        {gestores.map((gestor) => (
                          <div key={gestor.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                            <div>
                              <p className="text-white font-medium">{gestor.nome}</p>
                              <p className="text-xs text-slate-500">{gestor.email || "Sem e-mail"}</p>
                              <p className="text-xs text-violet-400 font-mono">{gestor.hash_acesso}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => deleteGestor(gestor.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Cadastro Empresas Tab */}
            <TabsContent value="empresas">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-violet-400" />
                    Cadastrar Nova Empresa
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Adicione empresas ao sistema SIA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveEmpresa} className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white/80">Nome de Exibição <span className="text-red-400">*</span></Label>
                        <Input
                          value={empresaForm.nome_exibicao}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, nome_exibicao: e.target.value })}
                          placeholder="Grazielle Diniz - Estética"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Slug <span className="text-red-400">*</span></Label>
                        <Input
                          value={empresaForm.slug}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, slug: e.target.value })}
                          placeholder="grazielle-diniz"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Hash Secreto <span className="text-red-400">*</span></Label>
                        <Input
                          value={empresaForm.hash_secreto}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, hash_secreto: e.target.value })}
                          placeholder="chave-secreta-empresa"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Gestor Responsável</Label>
                        <Select value={empresaForm.gestor_id} onValueChange={(value) => setEmpresaForm({ ...empresaForm, gestor_id: value })}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Selecione um gestor" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10">
                            {gestores.map((gestor) => (
                              <SelectItem key={gestor.id} value={gestor.id} className="text-white hover:bg-white/10">
                                {gestor.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Link Google Meu Negócio</Label>
                        <Input
                          value={empresaForm.link_google}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, link_google: e.target.value })}
                          placeholder="https://g.page/r/..."
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white/80">Link ASAAS</Label>
                        <Input
                          value={empresaForm.link_asaas}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, link_asaas: e.target.value })}
                          placeholder="https://www.asaas.com/c/..."
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white/80">Valor Assinatura</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={empresaForm.valor_assinatura}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, valor_assinatura: e.target.value })}
                            placeholder="99.90"
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/80">Data Vencimento</Label>
                          <Input
                            type="date"
                            value={empresaForm.data_vencimento}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, data_vencimento: e.target.value })}
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">WhatsApp</Label>
                        <Input
                          value={empresaForm.whatsapp_empresa}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, whatsapp_empresa: e.target.value })}
                          placeholder="11999999999"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">E-mail</Label>
                        <Input
                          type="email"
                          value={empresaForm.email_empresa}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, email_empresa: e.target.value })}
                          placeholder="contato@empresa.com"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Modelo de Sugestão</Label>
                        <Textarea
                          value={empresaForm.modelo_sugestao}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, modelo_sugestao: e.target.value })}
                          placeholder="Texto modelo para avaliações..."
                          rows={3}
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Button type="submit" disabled={savingEmpresa} className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-lg font-medium">
                        {savingEmpresa ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Cadastrar Empresa
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <footer className="mt-8 py-6 border-t border-white/5">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Zap className="w-4 h-4 text-violet-400" />
              <span className="text-sm">RSA Digital - Painel Administrativo</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
