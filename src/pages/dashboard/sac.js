import { useState } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';

export default function SAC() {
  const [nota, setNota] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [anexos, setAnexos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleFileChange = (e) => {
    setAnexos([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const formData = new FormData();
    formData.append('nota', nota);
    formData.append('observacoes', observacoes);
    anexos.forEach((file) => {
      formData.append('anexos', file);
    });

    const res = await fetch('/api/enviar-solicitacao-sac', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      setMensagem('Solicitação Enviada com Sucesso!');
      setNota('');
      setObservacoes('');
      setAnexos([]);
    } else {
      setMensagem('Ocorreu um erro ao enviar sua solicitação.');
    }
    setEnviando(false);
  };

  return (
    <DashboardLayout>
  <Head>
    <title>SAC - Portal do Cliente MVK</title>
  </Head>

  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Serviço de Atendimento ao Cliente
      </h2>
      <p className="text-gray-600">
        Prezado cliente, estamos aqui para ajudá-lo! Por favor, preencha os
        campos abaixo com as informações necessárias para que possamos
        compreender melhor sua solicitação e oferecer o melhor suporte
        possível. Após enviar sua solicitação, nossa equipe entrará em contato
        com você o mais rápido possível. Agradecemos pela confiança e estamos à
        disposição para atendê-lo.
      </p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Informe a Nota Fiscal, número da Proposta ou Pedido
        </label>
        <input
          type="text"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-4 py-2 focus:ring-mvk-500 focus:border-mvk-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Observações sobre sua solicitação
        </label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={4}
          required
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-4 py-2 focus:ring-mvk-500 focus:border-mvk-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Anexar arquivos
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mt-1"
        />
        <div className="mt-2">
          {anexos.length > 0 &&
            Array.from(anexos).map((file, idx) => (
              <p key={idx} className="text-sm text-gray-600">
                {file.name}
              </p>
            ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="bg-mvk-600 text-white px-6 py-2 rounded-lg hover:bg-mvk-700 transition"
      >
        {enviando ? 'Enviando...' : 'Enviar Solicitação'}
      </button>
    </form>

    {mensagem && (
      <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
        {mensagem}
        {mensagem.includes('Sucesso') && (
          <p className="text-sm">
            Um e-mail de confirmação foi enviado para seu endereço de login.
            Obrigado por utilizar nosso canal de atendimento!
          </p>
        )}
      </div>
    )}
  </div>
</DashboardLayout>
  );
}
