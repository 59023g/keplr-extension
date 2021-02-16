import React, { FunctionComponent, useEffect, useState } from "react";
import { Button } from "reactstrap";

import { HeaderLayout } from "../../layouts";

import style from "./style.module.scss";

import { useStore } from "../../stores";

import classnames from "classnames";
import { DataTab } from "./data-tab";
import { DetailsTab } from "./details-tab";
import { FormattedMessage, useIntl } from "react-intl";

import { useHistory } from "react-router";
import { observer } from "mobx-react";
import {
  useInteractionInfo,
  useSignDocHelper,
  useGasConfig,
  useFeeConfig,
  useMemoConfig,
} from "@keplr/hooks";
import { useAmountConfig } from "@keplr/hooks/build/tx/amount";

enum Tab {
  Details,
  Data,
}

export const SignPage: FunctionComponent = observer(() => {
  const history = useHistory();

  const [tab, setTab] = useState<Tab>(Tab.Details);

  const intl = useIntl();

  const {
    chainStore,
    keyRingStore,
    signInteractionStore,
    accountStore,
    queriesStore,
  } = useStore();
  const interactionInfo = useInteractionInfo(() => {
    signInteractionStore.rejectAll();
  });

  const current = chainStore.current;
  const gasConfig = useGasConfig(chainStore, current.chainId);
  const amountConfig = useAmountConfig(
    chainStore,
    current.chainId,
    accountStore.getAccount(current.chainId).bech32Address,
    queriesStore.get(current.chainId).getQueryBalances()
  );
  const feeConfig = useFeeConfig(
    chainStore,
    current.chainId,
    accountStore.getAccount(current.chainId).bech32Address,
    queriesStore.get(current.chainId).getQueryBalances(),
    amountConfig,
    gasConfig
  );
  const memoConfig = useMemoConfig(chainStore, current.chainId);

  const signDoc = signInteractionStore.waitingData?.signDoc;
  const signDocHelper = useSignDocHelper(feeConfig, memoConfig);

  const isSignDocInternalSend =
    interactionInfo.interaction &&
    interactionInfo.interactionInternal &&
    signDoc &&
    signDoc.msgs.length === 1 &&
    signDoc.msgs[0].type === "cosmos-sdk/MsgSend";

  useEffect(() => {
    if (signInteractionStore.waitingData) {
      const data = signInteractionStore.waitingData;
      chainStore.selectChain(data.chainId);
      signDocHelper.setSignDoc(data.signDoc);
      gasConfig.setGas(parseInt(data.signDoc.fee.gas));
      memoConfig.setMemo(data.signDoc.memo);
      if (isSignDocInternalSend) {
        feeConfig.setManualFee(data.signDoc.fee.amount[0]);
      }
    }
  }, [
    chainStore,
    gasConfig,
    memoConfig,
    feeConfig,
    signDocHelper,
    signInteractionStore.waitingData,
    isSignDocInternalSend,
  ]);

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo={false}
      onBackButton={
        interactionInfo.interactionInternal
          ? () => {
              history.goBack();
            }
          : undefined
      }
      style={{ background: "white" }}
    >
      <div className={style.container}>
        <div className={classnames(style.tabs)}>
          <ul>
            <li className={classnames({ active: tab === Tab.Details })}>
              <a
                className={style.tab}
                onClick={() => {
                  setTab(Tab.Details);
                }}
              >
                {intl.formatMessage({
                  id: "sign.tab.details",
                })}
              </a>
            </li>
            <li className={classnames({ active: tab === Tab.Data })}>
              <a
                className={style.tab}
                onClick={() => {
                  setTab(Tab.Data);
                }}
              >
                {intl.formatMessage({
                  id: "sign.tab.data",
                })}
              </a>
            </li>
          </ul>
        </div>
        <div
          className={classnames(style.tabContainer, {
            [style.dataTab]: tab === Tab.Data,
          })}
        >
          {tab === Tab.Data ? <DataTab signDocHelper={signDocHelper} /> : null}
          {tab === Tab.Details ? (
            <DetailsTab
              signDocHelper={signDocHelper}
              memoConfig={memoConfig}
              feeConfig={feeConfig}
              hideFeeButtons={isSignDocInternalSend}
            />
          ) : null}
        </div>
        <div style={{ flex: 1 }} />
        <div className={style.buttons}>
          {keyRingStore.keyRingType === "ledger" ? (
            <Button
              className={style.button}
              color="primary"
              disabled={true}
              outline
            >
              <FormattedMessage id="sign.button.confirm-ledger" />{" "}
              <i className="fa fa-spinner fa-spin fa-fw" />
            </Button>
          ) : (
            <React.Fragment>
              <Button
                className={style.button}
                color="danger"
                disabled={signDoc == null || signDocHelper.signDoc == null}
                data-loading={signInteractionStore.isLoading}
                onClick={(e) => {
                  e.preventDefault();

                  signInteractionStore.reject();
                }}
                outline
              >
                {intl.formatMessage({
                  id: "sign.button.reject",
                })}
              </Button>
              <Button
                className={style.button}
                color="primary"
                disabled={
                  signDoc == null ||
                  signDocHelper.signDoc == null ||
                  memoConfig.getError() != null ||
                  feeConfig.getError() != null
                }
                data-loading={signInteractionStore.isLoading}
                onClick={async (e) => {
                  e.preventDefault();

                  if (signDocHelper.signDoc) {
                    await signInteractionStore.approve(signDocHelper.signDoc);
                  }

                  if (
                    interactionInfo.interaction &&
                    !interactionInfo.interactionInternal
                  ) {
                    window.close();
                  }
                }}
              >
                {intl.formatMessage({
                  id: "sign.button.approve",
                })}
              </Button>
            </React.Fragment>
          )}
        </div>
      </div>
    </HeaderLayout>
  );
});