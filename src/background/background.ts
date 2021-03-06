import { MessageManager } from "../common/message";

import * as PersistentMemory from "./persistent-memory/internal";
import * as Chains from "./chains/internal";
import * as Ledger from "./ledger/internal";
import * as KeyRing from "./keyring/internal";
import * as SecretWasm from "./secret-wasm/internal";
import * as BackgroundTx from "./tx/internal";
import * as Updater from "./updater/internal";
import * as Tokens from "./tokens/internal";

import { BrowserKVStore } from "../common/kvstore";

import { BACKGROUND_PORT } from "../common/message/constant";
import { EmbedAccessOrigins, EmbedChainInfos } from "../config";
import { openWindow } from "../common/window";

const messageManager = new MessageManager();

const persistentMemory = new PersistentMemory.PersistentMemoryKeeper();
PersistentMemory.init(messageManager, persistentMemory);

const chainUpdaterKeeper = new Updater.ChainUpdaterKeeper(
  new BrowserKVStore("updater")
);

const tokensKeeper = new Tokens.TokensKeeper(
  new BrowserKVStore("tokens"),
  openWindow
);
Tokens.init(messageManager, tokensKeeper);

const chainsKeeper = new Chains.ChainsKeeper(
  new BrowserKVStore("chains"),
  chainUpdaterKeeper,
  tokensKeeper,
  EmbedChainInfos,
  EmbedAccessOrigins,
  openWindow
);
Chains.init(messageManager, chainsKeeper);

const ledgerKeeper = new Ledger.LedgerKeeper(new BrowserKVStore("ledger"));
Ledger.init(messageManager, ledgerKeeper);

const keyRingKeeper = new KeyRing.KeyRingKeeper(
  EmbedChainInfos,
  new BrowserKVStore("keyring"),
  chainsKeeper,
  ledgerKeeper,
  openWindow
);
KeyRing.init(messageManager, keyRingKeeper);

tokensKeeper.init(chainsKeeper, keyRingKeeper);

const secretWasmKeeper = new SecretWasm.SecretWasmKeeper(
  new BrowserKVStore("secretwasm"),
  chainsKeeper,
  keyRingKeeper
);
SecretWasm.init(messageManager, secretWasmKeeper);

const backgroundTxKeeper = new BackgroundTx.BackgroundTxKeeper(chainsKeeper);
BackgroundTx.init(messageManager, backgroundTxKeeper);

messageManager.listen(BACKGROUND_PORT);
