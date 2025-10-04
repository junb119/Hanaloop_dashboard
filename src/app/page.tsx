// 루트 경로로 들어온 사용자를 바로 대시보드로 이동시키는 진입용 페이지입니다.
import { redirect } from "next/navigation";

export default function IndexPage() {
  redirect("/dashboard");
}
