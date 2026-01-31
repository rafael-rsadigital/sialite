import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shield, Users, AlertTriangle, DollarSign, ExternalLink, Calendar, ArrowLeft, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  gestor_id: string | null;
  created_at: string;
}

interface Gestor {
  id: string;
  nome: string;
  email: string | null;
  hash_acesso: string;
}

export default function DashboardGestor() {
  const { gestorId } = useParams<{ gestorId: string }>();
  const navigate = useNavigate();
  const [gestor, setGestor] = useState<Gestor | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (gestorId) {
      fetchData();
    }
  }, [gestorId]);

  const fetchData = async () => {
    setLoading(true);

    // Buscar dados do gestor
    const { data: gestorData, error: gestorError } = await supabase
      .from("gestores")
      .select("*")
      .eq("id", gestorId)
      .single();

    if (gestorError || !gestorData) {
      toast.error("Gestor não encontrado");
      navigate("/acesso");
      return;
    }

    setGestor(gestorData);

    // Buscar empresas deste gestor
    const { data: empresasData, error: empresasError } = await supabase
      .from("empresas")
      .select("*")
      .eq("gestor_id", gestorId)
      .order("created_at", { ascending: false });

    if (empresasError) {
      toast.error("Erro ao carregar empresas");
    } else {
      setEmpresas(empresasData || []);
    }

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

  // Métricas
  const assinaturasAtivas = empresas.filter(e => e.status_assinatura).length;
  const vencidasInadimplentes = empresas.filter(e => !e.status_assinatura || isVencida(e.data_vencimento)).length;
  const mrr = empresas
    .filter(e => e.status_assinatura)
    .reduce((acc, e) => acc + (e.valor_assinatura || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Button
              variant="ghost"
              onClick={() => navigate("/acesso")}
              className="text-white/60 hover:text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Sair
            </Button>
            
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Olá, {gestor?.nome}
                </h1>
                <p className="text-slate-400 text-sm">
                  Painel de Gestão das suas Empresas
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
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
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                Minhas Empresas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {empresas.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Nenhuma empresa vinculada à sua conta</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-slate-400">Empresa</TableHead>
                        <TableHead className="text-slate-400">Slug</TableHead>
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
                              {empresa.nome_exibicao}
                            </TableCell>
                            <TableCell className="text-slate-400">
                              {empresa.slug}
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
                                  className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-cyan-500/50"
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
        </div>
      </div>
    </div>
  );
}
