import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { CnpjResponse } from '../interface/cnpj-response.interface';
import { Cep } from '../interface/cep.interface';
import { ESTADOS, REGIOES } from '../models/brasil-maps';
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'minha-chave-super-secreta';
@Injectable({
  providedIn: 'root'
})

export class UtilService {
  constructor(private http: HttpClient) { }
  
  consultarCnpj(cnpj: string): Observable<CnpjResponse> {
    const cnpjLimpo = cnpj.replace(/[^\d]+/g, '');

    return this.http.get<CnpjResponse>(`/api/cnpj/${cnpjLimpo}`).pipe(
      tap((response: CnpjResponse) => {
        console.log('Resultado da busca do CNPJ:', response);
      })
    );
  }

  formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, ''); // Remove tudo que não é número
    if (cepLimpo.length === 8) {
      return `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5)}`;
    }
    return cep; // Retorna como veio caso não tenha 8 dígitos
  }

  consultarCep(cep: string): Observable<Cep> {
    const cepLimpo = cep.replace(/\D/g, '');
  
    return this.http.get<any>(`https://viacep.com.br/ws/${cepLimpo}/json/`).pipe(
      tap((response) => console.log('Resultado da busca do CEP:', response)),
      map((response) => {
        const uf = response.uf;
  
        return {
          cep: response.cep || '',
          logradouro: response.logradouro || '',
          complemento: response.complemento || '',
          unidade: '',
          bairro: response.bairro || '',
          localidade: response.localidade || '',
          uf: uf || '',
          estado: ESTADOS[uf] || '',
          regiao: REGIOES[uf] || '',
          ibge: response.ibge || '',
          gia: response.gia || '',
          ddd: response.ddd || '',
          siafi: response.siafi || ''
        } as Cep;
      })
    );
  }

  sanitizeCnpj(cnpj: string): string {
    return cnpj.replace(/\D/g, ''); // Remove tudo que não for número
  }

  encryptPassword(plainText: string): string {
    return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
  }

  decryptPassword(cipherText: string): string {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  generateKeywordsFromName(name: string): string[] {
    if (!name) return [];
  
    return name
      .toLowerCase()
      .replace(/[^a-z\s]/gi, '') // Remove tudo que não for letra ou espaço
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);
  }
  
}


