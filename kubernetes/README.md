# Kubernetes deployment

The manifests follow Kustomize's base-and-overlay model:

- `base/` contains only reusable Deployments and Services. It does not select a
  namespace, image registry, or public hostname.
- `overlays/production/` adds only production-specific configuration: the
  namespace, published images, instance label, and public Ingress.
- `argocd/` contains the Argo CD `Application` used to bootstrap continuous
  delivery of the production overlay.

Render the production resources locally without changing a cluster:

```sh
kubectl kustomize kubernetes/overlays/production
```

Install the Argo CD application after Argo CD and its `Application` CRD are
available in the cluster:

```sh
kubectl apply -k kubernetes/argocd
```

The application tracks `master` in the GitHub repository and
automatically prunes and self-heals the resources rendered from
`kubernetes/overlays/production`. The production overlay owns the `centmatch`
namespace explicitly; `CreateNamespace=true` also makes the first sync robust.
If Argo CD is installed outside the conventional `argocd` namespace, change
`metadata.namespace` in `argocd/application.yaml` before bootstrapping it.
Register repository credentials in Argo CD first if the repository is private.

The production overlay currently retains the existing `latest` image tags. For
repeatable releases, CI should publish immutable tags and update the two
`newTag` values in `overlays/production/kustomization.yaml`; that Git change is
what causes Argo CD to roll out a new release deterministically.
