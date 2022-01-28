import React from "react";

import { Container } from "../layout";
import { Alert } from "../misc/alert";
import Conf from "../../utils/conf";
import { useTranslation } from "react-i18next";
import { AlertTitle, styled } from "@mui/material";

const StyledUl = styled("ul")(({ theme }) => ({
  margin: "1rem -2rem 1rem 0",
  padding: 0,

  [theme.breakpoints.down("md")]: {
    margin: "1rem -3rem 1rem -1rem",
  },
}));

function AlertDefault() {
  return (
    <>
      <AlertTitle>说明</AlertTitle>
      <StyledUl>
        <li>本页面数据由第三方维护，不能绝对保证完整和正确，信息仅供参考，请勿用于不良用途。</li>
        <li>记录包含雀魂段位战金之间、玉之间及王座之间的牌谱。</li>
        <li>页面不是实时更新，对局一般会在结束后数分钟至数小时内出现。</li>
        <li>对局数据收集从 2019 年 11 月 29 日开始（玉南及王座南为 2019 年 8 月 23 日），之前的对局已无法获取。</li>
        <li>
          网站主线路会收集少量匿名浏览数据作后续改进及优化之用，如不希望被收集数据，请使用
          <a href={Conf.mirrorUrl}>镜像线路</a>。
        </li>
        <li>
          如有问题或建议，请戳 <a href="mailto:i@sapika.ch">SAPikachu (i@sapika.ch)</a> 或{" "}
          <a href="https://github.com/SAPikachu/amae-koromo/">提交 Issue</a>。
        </li>
        <li>
          感谢 <a href="https://twitter.com/EDWARDH_Jantama">EDWARDH</a> 提供新服务器。
        </li>
        <li>
          感谢 <a href="https://github.com/kamicloud/">Kamicloud</a> 提供部分数据。
        </li>
      </StyledUl>
    </>
  );
}

function AlertEn() {
  return (
    <>
      <AlertTitle>Notes</AlertTitle>
      <StyledUl>
        <li>
          This is a fan site, data accuracy can&apos;t be fully guaranteed, please use the data for reference only and
          don&apos;t use it for malicious purpose.
        </li>
        <li>
          Data is not updated in real-time, finished matches will show up on the site in a few minutes to a few hours.
        </li>
        <li>
          Data collection was started from 2019-11-29 (2019-08-23 for Jade South and Throne South matches), matches
          finished before then could no longer be retrived.
        </li>
        <li>
          Main mirror of the site collects small amount of anonymous usage data for improving the site. If you wish to
          opt-out from this, please use <a href={Conf.mirrorUrl}>the alternative mirror</a>.
        </li>
        <li>
          If you have any question or suggestion, feel free to email{" "}
          <a href="mailto:i@sapika.ch">SAPikachu (i@sapika.ch)</a> or{" "}
          <a href="https://github.com/SAPikachu/amae-koromo/">submit an issue</a>.
        </li>
        <li>
          English translation of the site is contributed by <a href="https://github.com/Mjonir">Mjonir</a> and{" "}
          <a href="https://github.com/kator-278">kator-278</a>. Thank you!
        </li>
        <li>
          Thanks <a href="https://twitter.com/EDWARDH_Jantama">EDWARDH</a> for providing new server.
        </li>
        <li>
          Thanks <a href="https://github.com/kamicloud/">Kamicloud</a> for providing some missing data.
        </li>
      </StyledUl>
    </>
  );
}

function AlertJa() {
  return (
    <>
      <AlertTitle>説明</AlertTitle>
      <StyledUl>
        <li>
          当サイトは非公式サイトで、データの完全性と正確性が保証できません、予めご了承ください。サイトの内容を悪用しないでください。
        </li>
        <li>データの更新はリアルタイムではありません。対局がサイトに載るまで数分から数時間がかかります。</li>
        <li>
          データの収集は 2019 年 11 月 29 日から（玉南と王座南は 2019 年 8 月 23
          日）です。収集開始以前の対局は検索できません。
        </li>
        <li>
          <a href={"https://" + Conf.canonicalDomain}>メインサイト</a>
          はサービス向上のため、少しの匿名化された利用情報を収集しています。希望しない方は、
          <a href={Conf.mirrorUrl}>ミラーサイト</a>をご利用ください。
        </li>
        <li>
          内容の誤り・誤植等はご報告いただけますと幸いです。 <a href="mailto:i@sapika.ch">SAPikachu (i@sapika.ch)</a>{" "}
          または <a href="https://github.com/SAPikachu/amae-koromo/">GitHub</a> でご連絡ください。
        </li>
        <li>
          新しいサーバーを提供してくださった <a href="https://twitter.com/EDWARDH_Jantama">EDWARDH</a> に感謝します。
        </li>
        <li>
          一部のデータを提供してくださった <a href="https://github.com/kamicloud/">Kamicloud</a> に感謝します。
        </li>
      </StyledUl>
    </>
  );
}

function AlertKo() {
  return (
    <>
      <AlertTitle>안내</AlertTitle>
      <StyledUl>
        <li>
          본 사이트는 비공식 사이트로, 데이터의 완전성과 정확성이 보증되지 않습니다. 사이트 내용을 악용하지 말아
          주십시오.
        </li>
        <li>
          데이터 갱신은 실시간으로 이루어지지 않습니다. 대국이 사이트에 반영되기까지는 수 분에서 수 시간이 걸립니다.
        </li>
        <li>
          데이터 수집은 2019년 11월 29일부터(옥탁 반장과 왕좌탁 반장은 2019년 8월 23일) 시작되었습니다. 수집 개시 이전의
          대국은 검색할 수 없습니다.
        </li>
        <li>
          <a href={"https://" + Conf.canonicalDomain}>메인 사이트</a>는 서비스 향상을 위해 약간의 익명 사용 데이터를
          수집하고 있습니다. 원치 않는 분은 <a href={Conf.mirrorUrl}>미러 사이트</a>를 이용해 주십시오.
        </li>
        <li>
          잘못된 내용 등이 있는 경우 <a href="mailto:i@sapika.ch">SAPikachu (i@sapika.ch)</a> 또는{" "}
          <a href="https://github.com/SAPikachu/amae-koromo/">GitHub</a>로 연락해주시길 바랍니다.
        </li>
        <li>
          한국어 번역은 <a href="https://github.com/limgit">limgit</a>가 도움을 주었습니다. 감사합니다!
        </li>
        <li>
          新しいサーバーを提供してくださった <a href="https://twitter.com/EDWARDH_Jantama">EDWARDH</a> に感謝します。
        </li>
        <li>
          一部のデータを提供してくださった <a href="https://github.com/kamicloud/">Kamicloud</a> に感謝します。
        </li>
      </StyledUl>
    </>
  );
}

export function AppHeader() {
  const { i18n } = useTranslation();
  return (
    <Alert container={Container} stateName="topNote20211211">
      {i18n.language.indexOf("ja") === 0 ? (
        <AlertJa />
      ) : i18n.language.indexOf("en") === 0 ? (
        <AlertEn />
      ) : i18n.language.indexOf("ko") === 0 ? (
        <AlertKo />
      ) : (
        <AlertDefault />
      )}
    </Alert>
  );
}
