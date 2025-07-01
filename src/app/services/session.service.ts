import { Injectable } from '@angular/core';
import { User } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly SESSION_KEY = 'user_session';

  /**
   * Salva os dados do usuário na sessão (localStorage).
   * @param user Usuário autenticado.
   */
  setSession(user: User): void {
    if (!user || !user.id || !user.email) {
      console.warn('Dados inválidos para a sessão do usuário.');
      return;
    }

    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));

      // Valida se foi salvo corretamente
      const saved = localStorage.getItem(this.SESSION_KEY);
      const parsed = saved ? JSON.parse(saved) : null;

      if (!parsed || parsed.id !== user.id) {
        console.error('Falha ao salvar a sessão do usuário.');
      } else {
        console.info('Sessão salva com sucesso.');
      }
    } catch (error) {
      console.error('Erro ao salvar a sessão:', error);
    }
  }

  /**
   * Remove a sessão do usuário.
   */
  clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      if (localStorage.getItem(this.SESSION_KEY)) {
        console.error('Falha ao remover a sessão.');
      } else {
        console.info('Sessão removida com sucesso.');
      }
    } catch (error) {
      console.error('Erro ao remover sessão:', error);
    }
  }

  /**
   * Retorna os dados do usuário logado.
   */
  getSession(): User | null {
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Erro ao recuperar a sessão:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Limpa todo o localStorage.
   */
  clearAllStorage(): void {
    try {
      localStorage.clear();
      if (localStorage.length > 0) {
        console.error('Falha ao limpar completamente o localStorage.');
      } else {
        console.info('Todos os dados foram removidos do localStorage.');
      }
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }
}
