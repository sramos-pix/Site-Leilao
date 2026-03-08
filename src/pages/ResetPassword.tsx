"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Loader2, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Supabase envia o token de recuperação no hash da URL.
  // O cliente Supabase processa automaticamente o hash e dispara onAuthStateChange
  // com o event 'PASSWORD_RECOVERY'.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
      if (event === 'SIGNED_IN' && session) {
        // Também aceita se já estiver logado via link (alguns clientes disparam SIGNED_IN)
        setSessionReady(true);
      }
    });

    // Verifica se já há sessão ativa (caso o usuário já tenha clicado no link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setDone(true);
      toast({
        title: 'Senha atualizada!',
        description: 'Sua nova senha foi definida com sucesso.',
      });

      // Redireciona para login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      let msg = error.message || 'Erro ao atualizar a senha. Tente novamente.';
      if (msg.toLowerCase().includes('same password')) {
        msg = 'A nova senha não pode ser igual à senha atual.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Link inválido ou expirado
  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="space-y-2 text-center pt-8">
            <div className="mx-auto bg-red-500 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2 shadow-lg shadow-red-200">
              <AlertCircle size={24} />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
              Link Inválido
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Este link de recuperação é inválido ou já expirou.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-2">
            <p className="text-sm text-slate-500 text-center leading-relaxed">
              Os links de recuperação de senha expiram após <strong>1 hora</strong>.
              Solicite um novo link para continuar.
            </p>
          </CardContent>
          <CardFooter className="bg-slate-50 p-6 flex flex-col space-y-4 border-t border-slate-100">
            <Link
              to="/forgot-password"
              className="w-full"
            >
              <Button className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-200">
                Solicitar Novo Link
              </Button>
            </Link>
            <Link
              to="/"
              className="text-xs text-slate-400 text-center hover:text-slate-600 flex items-center justify-center gap-1"
            >
              Voltar para o início <ArrowRight size={12} />
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl rounded-2xl overflow-hidden bg-white">
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="mx-auto bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2 shadow-lg shadow-orange-200">
            <ShieldCheck size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
            Nova Senha
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Escolha uma senha forte para proteger sua conta.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          {done ? (
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Senha atualizada!</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Sua senha foi redefinida com sucesso.
                <br />
                Você será redirecionado para o login em instantes...
              </p>
            </div>
          ) : (
            <>
              {errorMessage && (
                <Alert variant="destructive" className="mb-6 rounded-xl bg-red-50 border-red-100 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">{errorMessage}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nova senha (mín. 6 caracteres)"
                    className="pl-10 pr-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirme a nova senha"
                    className="pl-10 pr-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Indicador de força da senha */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            password.length >= level * 3
                              ? password.length >= 12
                                ? 'bg-green-500'
                                : password.length >= 8
                                ? 'bg-orange-400'
                                : 'bg-red-400'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      {password.length < 6
                        ? 'Senha muito curta'
                        : password.length < 8
                        ? 'Senha fraca'
                        : password.length < 12
                        ? 'Senha razoável'
                        : 'Senha forte ✓'}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    'Salvar Nova Senha'
                  )}
                </Button>
              </form>
            </>
          )}
        </CardContent>

        {!done && (
          <CardFooter className="bg-slate-50 p-6 flex flex-col space-y-4 border-t border-slate-100">
            <p className="text-sm text-slate-500 text-center font-medium">
              Lembrou a senha?{' '}
              <Link to="/login" className="text-orange-600 font-bold hover:underline">
                Voltar ao login
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;
