import { defineAction } from "astro:actions"
import { HttpSignal } from "@/server/request-context"
import {
  userLoginAction,
  adminLoginAction,
  userRegisterAction,
  logoutAction,
} from "@/server/actions/actions-auth"
import {
  updateProfileAction,
  changePasswordAction,
  deleteOwnCommentAction,
} from "@/server/actions/account-actions"
import {
  createArticleAction,
  updateArticleAction,
  restoreArticleRevisionAction,
  publishArticleAction,
  hideArticleAction,
  deleteArticleAction,
  hideCommentAction,
  approveCommentAction,
  deleteCommentAction,
  renameTagAction,
  removeTagAction,
} from "@/server/actions/admin-actions"
import { updateSiteSettingsAction } from "@/server/actions/admin-settings-actions"
function formAction(handler: (data: FormData) => Promise<void>) {
  return defineAction({
    accept: "form",
    async handler(data) {
      try {
        await handler(data)
        return {}
      } catch (error) {
        if (error instanceof HttpSignal && error.location)
          return { redirectTo: error.location }
        throw error
      }
    },
  })
}
export const server = {
  userLoginAction: formAction(userLoginAction),
  adminLoginAction: formAction(adminLoginAction),
  userRegisterAction: formAction(userRegisterAction),
  logoutAction: formAction(logoutAction),
  updateProfileAction: formAction(updateProfileAction),
  changePasswordAction: formAction(changePasswordAction),
  deleteOwnCommentAction: formAction(deleteOwnCommentAction),
  createArticleAction: formAction(createArticleAction),
  updateArticleAction: formAction(updateArticleAction),
  restoreArticleRevisionAction: formAction(restoreArticleRevisionAction),
  publishArticleAction: formAction(publishArticleAction),
  hideArticleAction: formAction(hideArticleAction),
  deleteArticleAction: formAction(deleteArticleAction),
  hideCommentAction: formAction(hideCommentAction),
  approveCommentAction: formAction(approveCommentAction),
  deleteCommentAction: formAction(deleteCommentAction),
  renameTagAction: formAction(renameTagAction),
  removeTagAction: formAction(removeTagAction),
  updateSiteSettingsAction: formAction(updateSiteSettingsAction),
}
