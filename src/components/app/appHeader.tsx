import React from "react";

import { Container } from "../layout";
import { Alert } from "../misc/alert";
import Conf from "../../utils/conf";
import { useTranslation } from "react-i18next";

function AlertDefault() {
  return (
    <>
      <h4>说明</h4>
      <ul>
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
          感谢 <a href="https://github.com/kamicloud/">Kamicloud</a> 提供部分数据。
        </li>
      </ul>
    </>
  );
}

function AlertEn() {
  return (
    <>
      <h4>Notes</h4>
      <ul>
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
          感谢 <a href="https://github.com/kamicloud/">Kamicloud</a> 提供部分数据。
        </li>
      </ul>
    </>
  );
}

function AlertJa() {
  return (
    <>
      <h4>説明</h4>
      <ul>
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
          感谢 <a href="https://github.com/kamicloud/">Kamicloud</a> 提供部分数据。
        </li>
      </ul>
    </>
  );
}

export function AppHeader() {
  const { i18n } = useTranslation();
  return (
    <Alert container={Container} stateName="topNote20201220">
      {i18n.language.indexOf("ja") === 0 ? (
        <AlertJa />
      ) : i18n.language.indexOf("en") === 0 ? (
        <AlertEn />
      ) : (
        <AlertDefault />
      )}
    </Alert>
  );
}
