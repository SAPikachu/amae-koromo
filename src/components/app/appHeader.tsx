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
        <li>{Conf.siteSpecificNotice}</li>
        <li>页面不是实时更新，对局一般会在结束后数分钟至数小时内出现。</li>
        <li>对局数据收集从{Conf.dateMin.format(" YYYY 年 M 月 D 日")}开始，之前的对局已无法获取。</li>
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

function AlertJa() {
  return (
    <>
      <h4>説明</h4>
      <ul>
        <li>
          当サイトは非公式サイトで、データの完全性と正確性が保証できません、予めご了承ください。サイトの内容を悪用しないでください。
        </li>
        <li>現時点では半荘戦だけ記録しています。東風戦のデータは含まれません。</li>
        <li>データの更新はリアルタイムではありません。対局がサイトに載せるまで数分から数時間がかかります。</li>
        <li>
          データの収集は{Conf.dateMin.format(" YYYY 年 M 月 D 日")}からです。収集が始まるまでの対戦は検索できません。
        </li>
        <li>
          <a href={"https://" + Conf.canonicalDomain}>メーンサイト</a>
          はサービス向上のため、少しの匿名使用情報を収集しています。希望しない方は、
          <a href={Conf.mirrorUrl}>ミラーサイト</a>を使ってください。
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
    <Alert container={Container} stateName="topNote20200501">
      {i18n.language.indexOf("ja") === 0 ? <AlertJa /> : <AlertDefault />}
    </Alert>
  );
}
