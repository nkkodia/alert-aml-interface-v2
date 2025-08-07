import { Component, OnInit } from '@angular/core';
import { ApiService, SentEmailLog, Page } from '../api.service';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-email-logs',
  templateUrl: './email-logs.component.html',
  imports: [
    DatePipe
  ],
  styleUrls: ['./email-logs.component.css']
})
export class EmailLogsComponent implements OnInit {
  emailLogs: SentEmailLog[] = [];
  currentFilters: any = { page: 0, size: 5, sortBy: 'sentAt', sortDir: 'desc' };
  currentPage: number = 0;
  totalPages: number = 1;
  totalElements: number = 0;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadEmailLogs();
  }

  loadEmailLogs(): void {
    this.apiService.getEmailLogs(this.currentFilters).subscribe({
      next: (page: Page<SentEmailLog>) => {
        this.emailLogs = page.content;
        this.currentPage = page.number;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
      },
      error: (err) => {
        console.error('Failed to load email logs:', err);
        this.emailLogs = [];
        this.currentPage = 0;
        this.totalPages = 1;
        this.totalElements = 0;
        alert("Erreur lors du chargement des logs d'e-mail. Voir la console pour plus de détails.");
      }
    });
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentFilters.page--;
      this.loadEmailLogs();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentFilters.page++;
      this.loadEmailLogs();
    }
  }

  goToPage(page: number): void {
    this.currentFilters.page = page;
    this.loadEmailLogs();
  }

  getPageNumbers(): number[] {
    const pageNumbers = [];
    for (let i = 0; i < this.totalPages; i++) {
      pageNumbers.push(i + 1);
    }
    return pageNumbers;
  }
}
