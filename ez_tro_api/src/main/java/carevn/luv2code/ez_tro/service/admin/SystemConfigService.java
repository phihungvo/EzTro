package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import carevn.luv2code.ez_tro.dto.requests.SystemConfigRequest;
import carevn.luv2code.ez_tro.dto.response.DefaultPlanConfigResponse;
import carevn.luv2code.ez_tro.dto.response.SystemConfigResponse;
import carevn.luv2code.ez_tro.entity.SubscriptionPlan;
import carevn.luv2code.ez_tro.entity.User;

/**
 * Service contract quản lý SystemConfig và helper cho subscription plan mặc định.
 */
public interface SystemConfigService {

    String DEFAULT_PLAN_ID = "default_plan_id";

    SystemConfigResponse create(SystemConfigRequest request);

    List<SystemConfigResponse> getAll();

    SystemConfigResponse getById(Integer id);

    SystemConfigResponse getByKey(String key);

    SystemConfigResponse update(Integer id, SystemConfigRequest request);

    void delete(Integer id);

    String getRequiredValue(String key);

    // Lấy gói mặc định đang được cấu hình ở cấp hệ thống.
    SubscriptionPlan getDefaultPlan();

    // Trả về config mặc định kèm thông tin plan để API quản trị hiển thị trực tiếp.
    DefaultPlanConfigResponse getDefaultPlanConfig();

    // Cập nhật hoặc tạo mới config gói mặc định.
    void setDefaultPlan(Integer planId);

    // Tự cấp subscription mặc định cho owner nếu owner đó chưa có gói active.
    void ensureDefaultSubscriptionForOwner(User user);
}
