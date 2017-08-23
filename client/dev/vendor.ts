import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { NgModule } from "@angular/core";
import { Component } from "@angular/core";
import { OnInit, ElementRef } from "@angular/core";
import { Inject, Injectable } from "@angular/core";
import { Input } from "@angular/core";

import { FormsModule } from "@angular/forms";

import { BrowserModule  } from "@angular/platform-browser";
import { DOCUMENT } from '@angular/platform-browser';

import { Observable } from "rxjs/Observable";

import * as io from 'socket.io-client/socket.io';

import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Routes, RouterModule } from "@angular/router";
