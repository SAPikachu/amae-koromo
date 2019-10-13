import React from "react";

import { Container } from "../layout";
import { Alert } from "../misc/alert";

export function AppHeader() {
  return (
    <React.Fragment>
      <Container>
        <h1>雀魂牌谱屋</h1>
      </Container>
      <Alert container={Container} stateName="topNote">
        <h4>说明</h4>
        <ul>
          <li>本页面由第三方维护，与雀魂官方无关。</li>
          <li>记录包含雀魂国服四人半庄段位战玉之间及王座之间的牌谱。</li>
          <li>
            正常情况下全部对局都会被记录，但不排除因网络问题遗漏部分对局的情况。另 2019 年 10 月 10 日前因程序 Bug
            每天晚间可能遗漏掉 10% ~ 20% 的对局，此 Bug 目前已经修复。
          </li>
          <li>页面不是实时更新，对局一般会在结束后二十分钟内出现。</li>
          <li>
            如有问题或建议，请戳 <a href="mailto:i@sapika.ch">SAPikachu (i@sapika.ch)</a> 或{" "}
            <a href="https://github.com/SAPikachu/amae-koromo/">提交 Issue</a>。
          </li>
        </ul>
      </Alert>
    </React.Fragment>
  );
}
