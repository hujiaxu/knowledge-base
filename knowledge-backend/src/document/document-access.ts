import { AuthUser } from "../auth/auth-user.interface";
import { RoleCode } from "../common/constants/roles";


/** 当前用户可读哪些文档：公开 ∪ 所在团队 ∪ 自己写的；管理员/审核员不限制 */
export type DocumentAccessScope = {
  unrestricted: boolean;
  userId: string;
  teamIds: string[];
};

export function accessFromUser(user: AuthUser): DocumentAccessScope {
  const roles = user.roles ?? []
  return {
    unrestricted: roles.includes(RoleCode.ADMIN) || roles.includes(RoleCode.REVIEWER),
    userId: user.userId,
    teamIds: user.teamIds ?? []
  }
}

export const ES_CHUNK_VISIBILITY_FIELDS = {
  isPublic: 'is_public',
   authorId: 'author_id',
   teamId: 'team_id'
}

export const ES_DOC_VISIBILITY_FIELDS = {
  isPublic: 'isPublic',
  authorId: 'authorId',
  teamId: 'teamId',
};

export function esVisibilityFilter(
  scope: DocumentAccessScope,
  fields: { isPublic: string; authorId: string; teamId: string },
): Record<string, unknown> | null {
  // 公开 ∪ 自己写的；有团队再 OR 所在团队。不判断 status，假定未发布未进索引。
  if (scope.unrestricted) return null
  const should: Record<string, unknown>[] = [
    { term: { [fields.isPublic]: true } },
    { term: { [fields.authorId]: scope.userId }}
  ]
  if (scope.teamIds.length) {
    should.push({ terms: { [fields.teamId]: scope.teamIds } })
  }
  return { bool: { should, minimum_should_match: 1 }}
}

/** 相关性查询放 must，可见性放 filter，避免权限条件影响打分 */
export function wrapEsQuery(
  query: Record<string, unknown>,
  filter: Record<string, unknown> | null
): Record<string, unknown> {
  if (!filter) return query
  return {
    bool: {
      must: [query],
      filter: [filter]
    }
  }
}