import { useState, useEffect } from "react";
import { Shield, Lock, Users, AlertTriangle, DollarSign, ExternalLink, Calendar, Zap, Building2, UserPlus, LayoutDashboard, Save, Trash2, Pencil, LogOut, Mail } from "lucide-react";
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
import { encerrarSessao, obterPerfilAtual } from "@/lib/auth";
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
  plano_assinatura: string;
  ciclo_cobranca: string;
  status_cobranca: string;
  periodo_teste_ate: string | null;
  created_at: string;
}

interface Gestor {
  id: string;
  nome: string;
  email: string | null;
  hash_acesso: string;
  created_at: string;
}

export default function AdminRSA() {
  const [autenticado, setAutenticado] = useState(false);
  const [email, setEmail] = useState("");
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
    plano_assinatura: "essencial",
    ciclo_cobranca: "mensal",
    status_cobranca: "ativo",
    periodo_teste_ate: "",
  });
  const [savingEmpresa, setSavingEmpresa] = useState(false);
  const [editingEmpresaId, setEditingEmpresaId] = useState<string | null>(null);

  const limparFormularioEmpresa = () => {
    setEditingEmpresaId(null);
    setEmpresaForm({ nome_exibicao: "", slug: "", hash_secreto: "", link_google: "", link_asaas: "", valor_assinatura: "", data_vencimento: "", gestor_id: "", whatsapp_empresa: "", email_empresa: "", modelo_sugestao: "", plano_assinatura: "essencial", ciclo_cobranca: "mensal", status_cobranca: "ativo", periodo_teste_ate: "" });
  };

  const iniciarEdicaoEmpresa = (empresa: Empresa) => {
    setEditingEmpresaId(empresa.id);
    setEmpresaForm({
      nome_exibicao: empresa.nome_exibicao,
      slug: empresa.slug,
      hash_secreto: empresa.hash_secreto,
      link_google: empresa.link_google || "",
      link_asaas: empresa.link_asaas || "",
      valor_assinatura: empresa.valor_assinatura?.toString() || "",
      data_vencimento: empresa.data_vencimento || "",
      gestor_id: empresa.gestor_id || "",
      whatsapp_empresa: empresa.whatsapp_empresa || "",
      email_empresa: empresa.email_empresa || "",
      modelo_sugestao: empresa.modelo_sugestao || "",
      plano_assinatura: empresa.plano_assinatura || "essencial",
      ciclo_cobranca: empresa.ciclo_cobranca || "mensal",
      status_cobranca: empresa.status_cobranca || "ativo",
      periodo_teste_ate: empresa.periodo_teste_ate || "",
    });
    setActiveTab("empresas");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha) { setErroSenha("Informe seu e-mail e sua senha"); return; }
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error || !data.user) { setErroSenha("E-mail ou senha inválidos"); return; }
    const perfil = await obterPerfilAtual();
    if (perfil?.papel !== "administrador") {
      await encerrarSessao();
      setErroSenha("Esta conta não possui permissão de administrador");
      return;
    }
    setAutenticado(true);
    setErroSenha("");
  };

  useEffect(() => {
    async function recuperarSessao() {
      const perfil = await obterPerfilAtual();
      if (perfil?.papel === "administrador") setAutenticado(true);
      else setLoading(false);
    }
    recuperarSessao();
  }, []);

  useEffect(() => {
    if (autenticado) fetchData();
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
    const payload = {
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
      plano_assinatura: empresaForm.plano_assinatura,
      ciclo_cobranca: empresaForm.ciclo_cobranca,
      status_cobranca: empresaForm.status_cobranca,
      periodo_teste_ate: empresaForm.periodo_teste_ate || null,
    };

    const request = editingEmpresaId
      ? supabase.from("empresas").update(payload).eq("id", editingEmpresaId).select().single()
      : supabase.from("empresas").insert(payload).select().single();
    const { data, error } = await request;

    if (error) {
      toast.error(error.message.includes("duplicate") ? "Slug já existe" : "Erro ao salvar empresa");
    } else if (data) {
      toast.success(editingEmpresaId ? "Empresa atualizada com sucesso!" : "Empresa cadastrada com sucesso!");
      setEmpresas((atual) => editingEmpresaId ? atual.map((empresa) => empresa.id === data.id ? data : empresa) : [data, ...atual]);
      limparFormularioEmpresa();
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
      <div className="ink-shell flex items-center justify-center relative overflow-hidden p-4">

        <Card className="relative bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20 max-w-md w-full animate-fade-in">
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 mb-6">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Painel RSA Digital</h1>
            <p className="text-slate-400 mb-8">Entre com a conta administrativa cadastrada no Supabase</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><Input
                type="email"
                autoComplete="email"
                placeholder="administrador@empresa.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErroSenha(""); }}
                className="bg-white/5 border-white/10 pl-10 text-white placeholder:text-slate-500 h-12 focus:border-violet-500/50 focus:ring-violet-500/20"
              /></div>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="Senha"
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
    <div className="ink-shell relative overflow-hidden">

      <div className="relative py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Painel RSA Digital</h1>
                  <p className="text-slate-400 text-sm">Gestão Completa do SIA</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={async () => { await encerrarSessao(); setAutenticado(false); }} className="text-slate-300 hover:bg-white/10 hover:text-white"><LogOut className="mr-2 h-4 w-4" />Sair</Button>
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
                            <TableHead className="text-right text-slate-400">Ações</TableHead>
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
                                    <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => window.open(empresa.link_asaas!, '_blank')}><ExternalLink className="w-4 h-4 mr-1" />Abrir</Button>
                                  ) : <span className="text-slate-500 text-sm">—</span>}
                                </TableCell>
                                <TableCell className="text-right"><Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => iniciarEdicaoEmpresa(empresa)}><Pencil className="mr-1 h-3.5 w-3.5" />Editar</Button></TableCell>
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
                        {editingEmpresaId ? "Editar Empresa" : "Cadastrar Nova Empresa"}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {editingEmpresaId ? "Atualize os dados do cadastro selecionado" : "Adicione empresas ao sistema SIA"}
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white/80">Plano</Label>
                          <Select value={empresaForm.plano_assinatura} onValueChange={(value) => setEmpresaForm({ ...empresaForm, plano_assinatura: value })}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10">
                              <SelectItem value="essencial" className="text-white">Essencial</SelectItem>
                              <SelectItem value="profissional" className="text-white">Profissional</SelectItem>
                              <SelectItem value="parceiro" className="text-white">Parceiro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/80">Ciclo</Label>
                          <Select value={empresaForm.ciclo_cobranca} onValueChange={(value) => setEmpresaForm({ ...empresaForm, ciclo_cobranca: value })}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10">
                              <SelectItem value="mensal" className="text-white">Mensal</SelectItem>
                              <SelectItem value="trimestral" className="text-white">Trimestral</SelectItem>
                              <SelectItem value="anual" className="text-white">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white/80">Status de cobrança</Label>
                          <Select value={empresaForm.status_cobranca} onValueChange={(value) => setEmpresaForm({ ...empresaForm, status_cobranca: value })}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10">
                              <SelectItem value="teste" className="text-white">Em teste</SelectItem>
                              <SelectItem value="ativo" className="text-white">Ativo</SelectItem>
                              <SelectItem value="atrasado" className="text-white">Em atraso</SelectItem>
                              <SelectItem value="cancelado" className="text-white">Cancelado</SelectItem>
                              <SelectItem value="isento" className="text-white">Isento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/80">Teste até</Label>
                          <Input type="date" value={empresaForm.periodo_teste_ate} onChange={(e) => setEmpresaForm({ ...empresaForm, periodo_teste_ate: e.target.value })} className="bg-white/5 border-white/10 text-white" />
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

                    <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
                      <Button type="submit" disabled={savingEmpresa} className="h-12 flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-lg font-medium">
                        {savingEmpresa ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5 mr-2" />{editingEmpresaId ? "Salvar Alterações" : "Cadastrar Empresa"}</>}
                      </Button>
                      {editingEmpresaId && <Button type="button" variant="outline" onClick={limparFormularioEmpresa} className="h-12 border-white/20 text-white hover:bg-white/10">Cancelar edição</Button>}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Acessos Tab */}
            <TabsContent value="acessos" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2"><KeyRound className="w-5 h-5 text-violet-400" />Criar / atualizar acesso</CardTitle>
                    <CardDescription className="text-slate-400">Cadastre o login do empresário ou do gestor. Se o e-mail já existir, o perfil é apenas vinculado (e a senha atualizada, se informada).</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSalvarAcesso} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white/80">E-mail <span className="text-red-400">*</span></Label>
                        <Input type="email" value={acessoForm.email} onChange={(e) => setAcessoForm({ ...acessoForm, email: e.target.value })} placeholder="empresario@empresa.com" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Senha (mín. 8 caracteres)</Label>
                        <Input type="text" value={acessoForm.senha} onChange={(e) => setAcessoForm({ ...acessoForm, senha: e.target.value })} placeholder="senha inicial" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Nome de exibição</Label>
                        <Input value={acessoForm.nome_exibicao} onChange={(e) => setAcessoForm({ ...acessoForm, nome_exibicao: e.target.value })} placeholder="Nome do responsável" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Papel <span className="text-red-400">*</span></Label>
                        <Select value={acessoForm.papel} onValueChange={(v) => setAcessoForm({ ...acessoForm, papel: v, empresa_id: "", gestor_id: "" })}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10 text-white">
                            <SelectItem value="empresa">Empresa</SelectItem>
                            <SelectItem value="gestor">Gestor</SelectItem>
                            <SelectItem value="administrador">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {acessoForm.papel === "empresa" && (
                        <div className="space-y-2">
                          <Label className="text-white/80">Empresa <span className="text-red-400">*</span></Label>
                          <Select value={acessoForm.empresa_id} onValueChange={(v) => setAcessoForm({ ...acessoForm, empresa_id: v })}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                              {empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome_exibicao}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {acessoForm.papel === "gestor" && (
                        <div className="space-y-2">
                          <Label className="text-white/80">Gestor <span className="text-red-400">*</span></Label>
                          <Select value={acessoForm.gestor_id} onValueChange={(v) => setAcessoForm({ ...acessoForm, gestor_id: v })}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Selecione o gestor" /></SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                              {gestores.map((g) => <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <Button type="submit" disabled={savingAcesso} className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                        {savingAcesso ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Salvar acesso</>}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2"><Users className="w-5 h-5 text-violet-400" />Acessos cadastrados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingAcessos ? (
                      <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>
                    ) : acessos.length === 0 ? (
                      <p className="text-slate-400 text-center py-8">Nenhum acesso cadastrado</p>
                    ) : (
                      <div className="space-y-3">
                        {acessos.map((a) => (
                          <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="min-w-0">
                              <p className="text-white text-sm truncate">{a.email || a.nome_exibicao || a.id}</p>
                              <p className="text-xs text-slate-500 truncate">
                                {a.papel === "empresa" ? `Empresa · ${empresas.find((e) => e.id === a.empresa_id)?.nome_exibicao || "—"}`
                                  : a.papel === "gestor" ? `Gestor · ${gestores.find((g) => g.id === a.gestor_id)?.nome || "—"}`
                                  : "Administrador"}
                              </p>
                            </div>
                            <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => removerAcesso(a.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
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
