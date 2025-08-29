import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-chat-image-modal',
  templateUrl: './chat-image-modal.component.html',
  styleUrls: ['./chat-image-modal.component.css']
})
export class ChatImageModalComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string },
    private dialogRef: MatDialogRef<ChatImageModalComponent>
  ) {}

  ngOnInit() {
  }

}
