import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

const statusOptions = ["Pendente", "Em Andamento", "Finalizada", "Cancelada"];

function App() {
  const [clientes, setClientes] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [aba, setAba] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const [clienteForm, setClienteForm] = useState({
    nome: "",
    email: "",
    telefone: "",
  });

  const [ordemForm, setOrdemForm] = useState({
    cliente_id: "",
    descricao: "",
    valor: "",
  });

  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    buscarClientes();
    buscarOrdens();
  }, []);

  async function buscarClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMensagem("Erro ao buscar clientes.");
      return;
    }

    setClientes(data || []);
  }

  async function buscarOrdens() {
    const { data, error } = await supabase
      .from("ordens_servico")
      .select(`
        *,
        clientes (
          nome
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMensagem("Erro ao buscar ordens de serviço.");
      return;
    }

    setOrdens(data || []);
  }

  function emailValido(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  async function cadastrarCliente(e) {
    e.preventDefault();
    setMensagem("");

    if (!clienteForm.nome || !clienteForm.email || !clienteForm.telefone) {
      setMensagem("Preencha todos os campos do cliente.");
      return;
    }

    if (!emailValido(clienteForm.email)) {
      setMensagem("Informe um e-mail válido.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("clientes").insert([clienteForm]);

    setLoading(false);

    if (error) {
      console.error(error);
      setMensagem("Erro ao cadastrar cliente.");
      return;
    }

    setClienteForm({ nome: "", email: "", telefone: "" });
    setMensagem("Cliente cadastrado com sucesso!");
    buscarClientes();
  }

  async function criarOrdem(e) {
    e.preventDefault();
    setMensagem("");

    if (!ordemForm.cliente_id || !ordemForm.descricao || !ordemForm.valor) {
      setMensagem("Preencha todos os campos da ordem de serviço.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("ordens_servico").insert([
      {
        cliente_id: Number(ordemForm.cliente_id),
        descricao: ordemForm.descricao,
        valor: Number(ordemForm.valor),
        status: "Pendente",
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      setMensagem("Erro ao criar ordem de serviço.");
      return;
    }

    setOrdemForm({ cliente_id: "", descricao: "", valor: "" });
    setMensagem("Ordem de serviço criada com sucesso!");
    buscarOrdens();
  }

  async function atualizarStatus(id, novoStatus) {
    const { error } = await supabase
      .from("ordens_servico")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      console.error(error);
      setMensagem("Erro ao atualizar status.");
      return;
    }

    setMensagem("Status atualizado com sucesso!");
    buscarOrdens();
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const totalOS = ordens.length;
  const pendentes = ordens.filter((os) => os.status === "Pendente").length;
  const andamento = ordens.filter((os) => os.status === "Em Andamento").length;
  const finalizadas = ordens.filter((os) => os.status === "Finalizada").length;

  const faturamento = ordens
    .filter((os) => os.status === "Finalizada")
    .reduce((total, os) => total + Number(os.valor), 0);

  const ordensFiltradas = ordens.filter((os) => {
    const statusOk = filtroStatus === "Todos" || os.status === filtroStatus;

    const buscaOk =
      os.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      os.clientes?.nome?.toLowerCase().includes(busca.toLowerCase());

    return statusOk && buscaOk;
  });

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>TecFix</h1>
        <p>Controle de Ordens de Serviço</p>

        <button onClick={() => setAba("dashboard")}>Painel</button>
        <button onClick={() => setAba("clientes")}>Clientes</button>
        <button onClick={() => setAba("ordens")}>Ordens de Serviço</button>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h2>Mini ERP TecFix</h2>
            <p>Gerencie clientes, ordens e faturamento.</p>
          </div>
        </header>

        {mensagem && <div className="mensagem">{mensagem}</div>}

        {aba === "dashboard" && (
          <section>
            <h2>Painel de Controle</h2>

            <div className="cards">
              <div className="card">
                <span>Total de OS</span>
                <strong>{totalOS}</strong>
              </div>

              <div className="card red">
                <span>Pendentes</span>
                <strong>{pendentes}</strong>
              </div>

              <div className="card yellow">
                <span>Em Andamento</span>
                <strong>{andamento}</strong>
              </div>

              <div className="card green">
                <span>Finalizadas</span>
                <strong>{finalizadas}</strong>
              </div>

              <div className="card blue">
                <span>Faturamento</span>
                <strong>{formatarMoeda(faturamento)}</strong>
              </div>
            </div>
          </section>
        )}

        {aba === "clientes" && (
          <section>
            <h2>Gestão de Clientes</h2>

            <form className="form" onSubmit={cadastrarCliente}>
              <input
                type="text"
                placeholder="Nome"
                value={clienteForm.nome}
                onChange={(e) =>
                  setClienteForm({ ...clienteForm, nome: e.target.value })
                }
              />

              <input
                type="email"
                placeholder="E-mail"
                value={clienteForm.email}
                onChange={(e) =>
                  setClienteForm({ ...clienteForm, email: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Telefone"
                value={clienteForm.telefone}
                onChange={(e) =>
                  setClienteForm({ ...clienteForm, telefone: e.target.value })
                }
              />

              <button disabled={loading}>
                {loading ? "Salvando..." : "Cadastrar Cliente"}
              </button>
            </form>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Telefone</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>{cliente.nome}</td>
                      <td>{cliente.email}</td>
                      <td>{cliente.telefone}</td>
                    </tr>
                  ))}

                  {clientes.length === 0 && (
                    <tr>
                      <td colSpan="3">Nenhum cliente cadastrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {aba === "ordens" && (
          <section>
            <h2>Gestão de Ordens de Serviço</h2>

            <form className="form" onSubmit={criarOrdem}>
              <select
                value={ordemForm.cliente_id}
                onChange={(e) =>
                  setOrdemForm({ ...ordemForm, cliente_id: e.target.value })
                }
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Descrição do problema"
                value={ordemForm.descricao}
                onChange={(e) =>
                  setOrdemForm({ ...ordemForm, descricao: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Valor"
                value={ordemForm.valor}
                onChange={(e) =>
                  setOrdemForm({ ...ordemForm, valor: e.target.value })
                }
              />

              <button disabled={loading}>
                {loading ? "Salvando..." : "Criar OS"}
              </button>
            </form>

            <div className="filters">
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="Todos">Todos os status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Buscar por cliente ou descrição"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Alterar Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ordensFiltradas.map((os) => (
                    <tr key={os.id}>
                      <td>{os.clientes?.nome || "Cliente não encontrado"}</td>
                      <td>{os.descricao}</td>
                      <td>{formatarMoeda(os.valor)}</td>
                      <td>
                        <span className={`status ${os.status.replace(" ", "-")}`}>
                          {os.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={os.status}
                          onChange={(e) =>
                            atualizarStatus(os.id, e.target.value)
                          }
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}

                  {ordensFiltradas.length === 0 && (
                    <tr>
                      <td colSpan="5">Nenhuma OS encontrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;