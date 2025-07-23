import { Injectable, inject } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService as NgxTranslateService } from '@ngx-translate/core';

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
  private translate = inject(NgxTranslateService);

  constructor() {
    super();
    this.translate.onLangChange.subscribe(() => {
      this.setTranslations();
      this.changes.next(); // Notifica os componentes para atualizarem os textos
    });

    this.setTranslations(); // Inicializa as traduções
  }

  private setTranslations(): void {
    this.itemsPerPageLabel = this.translate.instant('paginator.itemsPerPageLabel');
    this.nextPageLabel = this.translate.instant('paginator.nextPageLabel');
    this.previousPageLabel = this.translate.instant('paginator.previousPageLabel');
    this.firstPageLabel = this.translate.instant('paginator.firstPageLabel');
    this.lastPageLabel = this.translate.instant('paginator.lastPageLabel');

    this.getRangeLabel = (page: number, pageSize: number, length: number): string => {
      if (length === 0 || pageSize === 0) {
        return this.translate.instant('paginator.rangeLabel.empty', { length });
      }

      const startIndex = page * pageSize;
      const endIndex = Math.min(startIndex + pageSize, length);

      return this.translate.instant('paginator.rangeLabel.full', {
        start: startIndex + 1,
        end: endIndex,
        length
      });
    };
  }
}
