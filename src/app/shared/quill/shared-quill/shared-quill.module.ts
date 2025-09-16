// shared-quill.module.ts
import { NgModule } from '@angular/core';
import { QuillModule } from 'ngx-quill';

@NgModule({
  imports: [QuillModule], // apenas referência direta
  exports: [QuillModule]
})
export class SharedQuillModule {}
