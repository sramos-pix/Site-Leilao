"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowRight, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // 1. Verificar se o email está cadastrado antes de enviar
      const { data: checkData, error: checkError } = await supabase.functions.invoke('check-email', {
        body: { email: email.trim().toLowerCase() },
      });

      if (checkError) throw checkError;
      if (checkData?.error) throw new Error(checkData.error);

      if (!checkData?.exists) {
        setErrorMessage('Este e-mail não está cadastrado na AutoBid BR. Verifique o endereço ou crie uma conta.');
        setIsLoading(false);
        return;
      }

      // 2. Email existe — enviar link de redefinição
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
    } catch (error: any) {
      const msg = error.message || 'Erro ao enviar o e-mail. Tente novamente.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl rounded-2xl overflow-hidden bg-white">
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="mx-auto bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2 shadow-lg shadow-orange-200">
            <KeyRound size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Digite seu e-mail e enviaremos um link para redefinir sua senha.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          {sent ? (
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">E-mail enviado!</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Enviamos um link de redefinição para{' '}
                <span className="font-bold text-slate-700">{email}</span>.
                <br />
                Verifique sua caixa de entrada (e o spam, se não encontrar).
              </p>
              <p className="text-xs text-slate-400 mt-2">
                O link expira em 1 hora.
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
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    type="email"
                    placeholder="Seu e-mail cadastrado"
                    className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    'Enviar Link de Recuperação'
                  )}
                </Button>
              </form>
            </>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50 p-6 flex flex-col space-y-4 border-t border-slate-100">
          <p className="text-sm text-slate-500 text-center font-medium">
            Lembrou a senha?{' '}
            <Link to="/login" className="text-orange-600 font-bold hover:underline">
              Voltar ao login
            </Link>
          </p>
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
};

export default ForgotPassword;
